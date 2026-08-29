import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Float, ContactShadows, PresentationControls, Center } from '@react-three/drei';
import * as THREE from 'three';
import { useMousePosition } from '../../hooks/useMousePosition';

export type ExpressionType = 'neutral' | 'squint' | 'surprised' | 'happy' | 'wink' | 'suspicious';
const ACTIVE_EXPRESSIONS: ExpressionType[] = ['squint', 'surprised', 'happy', 'wink', 'suspicious'];

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// 40x32 Pixel Art Grid for 100% Euclidean Square Pixels on the Robot Visor
type Matrix40x32 = number[][];

function parse40x32(pattern: string[]): Matrix40x32 {
  return pattern.map((row) =>
    Array.from(row).map((char) => {
      if (char === '*') return 2;
      if (char === '#') return 1;
      return 0;
    })
  );
}

function create40x32Pattern(builder: (g: string[][]) => void): Matrix40x32 {
  const g: string[][] = Array.from({ length: 32 }, () => Array(40).fill('.'));
  builder(g);
  return parse40x32(g.map((r) => r.join('')));
}

function drawRect40x32(g: string[][], r: number, c: number, h: number, w: number, char = '#') {
  for (let i = r; i < r + h; i++) {
    for (let j = c; j < c + w; j++) {
      if (i >= 0 && i < 32 && j >= 0 && j < 40) {
        g[i][j] = char;
      }
    }
  }
}

function drawCircle40x32(g: string[][], cr: number, cc: number, radius: number, char = '#', fill = true, highlight = false) {
  for (let r = 0; r < 32; r++) {
    for (let c = 0; c < 40; c++) {
      const d = Math.sqrt((r - cr) ** 2 + (c - cc) ** 2);
      if (fill) {
        if (d <= radius) g[r][c] = char;
      } else {
        if (radius - 1.4 <= d && d <= radius + 0.4) g[r][c] = char;
      }
    }
  }
  if (highlight && fill && cr - 1 >= 0 && cc - 1 >= 0) {
    g[cr - 1][cc - 1] = '*';
    g[cr - 1][cc] = '*';
    g[cr][cc - 1] = '*';
  }
}

// 40x32 Pixel Art Expressions with Exact Proportions
const PIXEL_EXPRESSIONS_40X32: Record<ExpressionType, Matrix40x32> = {
  // f) Neutral (Resting): Two 10x10 rounded eyes with catchlights + 14px wide smile with dimples
  neutral: create40x32Pattern((g) => {
    drawCircle40x32(g, 10, 10, 4.5, '#', true, true);
    drawCircle40x32(g, 10, 30, 4.5, '#', true, true);
    drawRect40x32(g, 22, 13, 2, 14, '#');
    drawRect40x32(g, 21, 12, 2, 2, '*');
    drawRect40x32(g, 21, 26, 2, 2, '*');
  }),

  // a) >.< (Playful Squint): Angled downward chevrons + cute open smile
  squint: create40x32Pattern((g) => {
    for (let i = 0; i < 6; i++) {
      g[7 + i][5 + i] = '#';
      g[7 + i][5 + i + 1] = '*';
      g[12 + i][10 - i] = '#';
      g[12 + i][10 - i + 1] = '*';

      g[7 + i][35 - i] = '#';
      g[7 + i][35 - i - 1] = '*';
      g[12 + i][30 + i] = '#';
      g[12 + i][30 + i - 1] = '*';
    }
    drawRect40x32(g, 23, 15, 2, 10, '#');
    drawRect40x32(g, 22, 14, 2, 2, '*');
    drawRect40x32(g, 22, 24, 2, 2, '*');
  }),

  // b) :O (Surprised): Large 12x12 dual-layer circles + large 14x12 open O mouth
  surprised: create40x32Pattern((g) => {
    drawCircle40x32(g, 10, 10, 5.5, '#', false);
    drawCircle40x32(g, 10, 10, 4.0, '*', false);
    drawCircle40x32(g, 10, 30, 5.5, '#', false);
    drawCircle40x32(g, 10, 30, 4.0, '*', false);

    drawCircle40x32(g, 22, 20, 5.0, '#', false);
    drawCircle40x32(g, 22, 20, 3.5, '*', false);
  }),

  // c) ^_^ (Happy): Large 12px chevron arches + full 22px wide smile with dimples
  happy: create40x32Pattern((g) => {
    for (let i = 0; i < 7; i++) {
      g[13 - i][4 + i] = '#';
      g[12 - i][4 + i] = '*';
      g[7 + i][10 + i] = '#';
      g[6 + i][10 + i] = '*';

      g[13 - i][24 + i] = '#';
      g[12 - i][24 + i] = '*';
      g[7 + i][30 + i] = '#';
      g[6 + i][30 + i] = '*';
    }
    drawRect40x32(g, 23, 9, 2, 22, '#');
    drawRect40x32(g, 22, 8, 2, 2, '*');
    drawRect40x32(g, 22, 30, 2, 2, '*');
  }),

  // d) ;) (Wink): Closed horizontal bar (14px) + Large open 10x10 eye with catchlight + Smirk
  wink: create40x32Pattern((g) => {
    drawRect40x32(g, 10, 4, 2, 14, '#');
    drawRect40x32(g, 9, 4, 1, 14, '*');
    drawCircle40x32(g, 10, 30, 4.5, '#', true, true);
    drawRect40x32(g, 23, 14, 2, 12, '#');
    drawRect40x32(g, 21, 25, 2, 2, '*');
  }),

  // e) -_- (Suspicious): Twin 14px flat horizontal lines with top highlight + straight 14px mouth
  suspicious: create40x32Pattern((g) => {
    drawRect40x32(g, 10, 4, 2, 14, '#');
    drawRect40x32(g, 9, 4, 1, 14, '*');
    drawRect40x32(g, 10, 23, 2, 14, '#');
    drawRect40x32(g, 9, 23, 1, 14, '*');
    drawRect40x32(g, 23, 13, 2, 14, '#');
  }),
};

// UV-Calibrated Visor Texture Manager
class UVCalibratedVisorManager {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;

  readonly COLS = 40;
  readonly ROWS = 32;

  constructor() {
    this.canvas = document.createElement('canvas');
    // 640x512 canvas matches the 5:4 aspect ratio of the 3D visor exactly (640/40 = 16px, 512/32 = 16px)
    this.canvas.width = 640;
    this.canvas.height = 512;
    this.ctx = this.canvas.getContext('2d')!;

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.generateMipmaps = true;
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.magFilter = THREE.NearestFilter;

    // UV bounds mapping: U in [0.25, 0.78125], V in [0.0, 1.0]
    this.texture.wrapS = THREE.ClampToEdgeWrapping;
    this.texture.wrapT = THREE.ClampToEdgeWrapping;
    this.texture.repeat.set(0.53125, 1.0);
    this.texture.offset.set(0.250, 0.0);
    this.texture.flipY = false;

    this.draw('neutral', 'neutral', 1);
  }

  draw(fromExpr: ExpressionType, toExpr: ExpressionType, t: number) {
    const { ctx, canvas, COLS, ROWS } = this;
    const w = canvas.width;
    const h = canvas.height;

    // Deep Dark Visor Background (#0A0A0F)
    ctx.fillStyle = '#0A0A0F';
    ctx.fillRect(0, 0, w, h);

    const cellW = w / COLS; // 16px
    const cellH = h / ROWS; // 16px
    const gap = 1.0;

    const fromGrid = PIXEL_EXPRESSIONS_40X32[fromExpr];
    const toGrid = PIXEL_EXPRESSIONS_40X32[toExpr];

    // Render 40x32 Pixel Grid (100% Euclidean Square Pixels in 3D space)
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = Math.round(c * cellW);
        const y = Math.round(r * cellH);
        const pw = Math.round(cellW - gap);
        const ph = Math.round(cellH - gap);

        const valFrom = fromGrid[r][c];
        const valTo = toGrid[r][c];

        const intensity = (valFrom > 0 ? 1 : 0) * (1 - t) + (valTo > 0 ? 1 : 0) * t;
        const isHighlight = (valFrom === 2 ? 1 : 0) * (1 - t) + (valTo === 2 ? 1 : 0) * t > 0.5;

        if (intensity > 0.05) {
          // Soft Neon Glow Layer (#00F0FF with 20% opacity)
          ctx.shadowColor = '#00F0FF';
          ctx.shadowBlur = 8 * intensity;

          // Outer Glow
          ctx.fillStyle = `rgba(0, 240, 255, ${0.20 * intensity})`;
          ctx.fillRect(x - 2, y - 2, pw + 4, ph + 4);

          if (isHighlight) {
            // Edge Highlight: Lighter Cyan (#66F5FF)
            ctx.fillStyle = `rgba(102, 245, 255, ${0.98 * intensity})`;
          } else {
            // Main Pixel: Bright Cyan (#00F0FF)
            ctx.fillStyle = `rgba(0, 240, 255, ${0.92 * intensity})`;
          }
          ctx.fillRect(x, y, pw, ph);

          // Subtle inner pixel core
          ctx.fillStyle = `rgba(240, 255, 255, ${0.85 * intensity})`;
          ctx.fillRect(x + 2, y + 2, Math.max(1, pw - 4), Math.max(1, ph - 4));
        } else {
          // Unlit LED pixel grid dot
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(0, 240, 255, 0.03)';
          ctx.fillRect(x, y, pw, ph);
        }
      }
    }

    this.texture.needsUpdate = true;
  }
}

function RobotModel({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/assets/greeting_robot.glb');

  const visorMgr = useMemo(() => new UVCalibratedVisorManager(), []);

  // Expression State Tracking
  const currentExprRef = useRef<ExpressionType>('happy');
  const lastCycleRef = useRef<number>(-1);

  // Apply colors & exact UV-calibrated texture
  const styledScene = useMemo(() => {
    const cloned = scene.clone(true);

    // 1. Ivory Gradient Texture for Body & Head (#F5F0E8 → #E8DCC8)
    const ivoryCanvas = document.createElement('canvas');
    ivoryCanvas.width = 256;
    ivoryCanvas.height = 256;
    const iCtx = ivoryCanvas.getContext('2d')!;
    const iGrad = iCtx.createLinearGradient(0, 0, 0, 256);
    iGrad.addColorStop(0, '#F5F0E8');
    iGrad.addColorStop(1, '#E8DCC8');
    iCtx.fillStyle = iGrad;
    iCtx.fillRect(0, 0, 256, 256);
    const ivoryTexture = new THREE.CanvasTexture(ivoryCanvas);

    const bodyIvoryMat = new THREE.MeshStandardMaterial({
      map: ivoryTexture,
      color: new THREE.Color('#F5F0E8'),
      roughness: 0.18,
      metalness: 0.25,
    });

    // 2. Deep Red for Earcups (#D32F2F)
    const earcupsRedMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D32F2F'),
      roughness: 0.2,
      metalness: 0.45,
    });

    // 3. Radial Gradient for Chest Circle (Center: #FFFFFF → Edge: #008080)
    const radialCanvas = document.createElement('canvas');
    radialCanvas.width = 256;
    radialCanvas.height = 256;
    const rCtx = radialCanvas.getContext('2d')!;
    const rGrad = rCtx.createRadialGradient(128, 128, 15, 128, 128, 120);
    rGrad.addColorStop(0, '#FFFFFF');
    rGrad.addColorStop(0.55, '#00A8A8');
    rGrad.addColorStop(1, '#008080');
    rCtx.fillStyle = rGrad;
    rCtx.fillRect(0, 0, 256, 256);
    const radialTexture = new THREE.CanvasTexture(radialCanvas);

    const chestCircleMat = new THREE.MeshStandardMaterial({
      map: radialTexture,
      emissive: new THREE.Color('#008080'),
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.3,
    });

    // 4. Gold for Shoulder Cups / Neck / Accents (#C9A84C)
    const shoulderGoldMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#C9A84C'),
      roughness: 0.25,
      metalness: 0.85,
    });

    // 5. Warm Silver for Hands / Arms (#B8C0C8)
    const handsSilverMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#B8C0C8'),
      roughness: 0.2,
      metalness: 0.8,
    });

    // 6. UV-Calibrated Square Pixel Visor Material
    const faceVisorMat = new THREE.MeshBasicMaterial({
      map: visorMgr.texture,
      transparent: true,
      opacity: 0.99,
    });

    // Hide original 3D mouth, eyes, eyebrows meshes so ONLY the square pixel art appears
    cloned.traverse((child) => {
      const name = (child.name || '').toLowerCase();
      const parentName = (child.parent?.name || '').toLowerCase();
      const fullName = `${name} ${parentName}`;

      if (
        fullName.includes('mouth') ||
        fullName.includes('eyebrow') ||
        fullName.includes('brow') ||
        (fullName.includes('eye') && !fullName.includes('head_2'))
      ) {
        child.visible = false;
        child.scale.set(0, 0, 0);
      }

      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (name.includes('head_2')) {
          // Apply UV-offset texture directly to the intact GLTF visor geometry
          mesh.material = faceVisorMat;
          mesh.visible = true;
        } else if (fullName.includes('circle') || fullName.includes('core')) {
          mesh.material = chestCircleMat;
        } else if (
          fullName.includes('ear') ||
          fullName.includes('headphone') ||
          fullName.includes('cylinder')
        ) {
          mesh.material = earcupsRedMat;
        } else if (
          fullName.includes('shoulder') ||
          fullName.includes('neck')
        ) {
          mesh.material = shoulderGoldMat;
        } else if (
          fullName.includes('arm') ||
          fullName.includes('hand') ||
          fullName.includes('forearm')
        ) {
          mesh.material = handsSilverMat;
        } else if (!fullName.includes('mouth') && !fullName.includes('eye')) {
          mesh.material = bodyIvoryMat;
        }
      }
    });

    // Auto-center origin at (0, 0, 0)
    const bbox = new THREE.Box3().setFromObject(cloned);
    const centerVec = bbox.getCenter(new THREE.Vector3());
    cloned.position.x -= centerVec.x;
    cloned.position.y -= centerVec.y;
    cloned.position.z -= centerVec.z;

    return cloned;
  }, [scene, visorMgr]);

  // Rotated 180 degrees horizontally to face front
  const BASE_ROTATION_Y = -Math.PI * 0.5;

  useFrame(({ clock }, delta) => {
    // 1. Natural, smooth cursor tracking
    if (groupRef.current) {
      const targetRotY = BASE_ROTATION_Y + mouseX * 0.35;
      const targetRotX = -mouseY * 0.2;

      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        targetRotY,
        4.5,
        delta
      );
      groupRef.current.rotation.x = THREE.MathUtils.damp(
        groupRef.current.rotation.x,
        targetRotX,
        4.5,
        delta
      );
    }

    // 2. 7-Second Animation Loop:
    // - 0.0s - 0.5s: Smooth transition to random expression
    // - 0.5s - 2.0s: Hold expression (1.5s)
    // - 2.0s - 2.5s: Smooth transition back to neutral
    // - 2.5s - 7.0s: Neutral face (4.5s)
    const cycleDuration = 7.0;
    const totalElapsed = clock.getElapsedTime();
    const cycleIndex = Math.floor(totalElapsed / cycleDuration);
    const cycleTime = totalElapsed % cycleDuration;

    if (cycleIndex > lastCycleRef.current) {
      lastCycleRef.current = cycleIndex;
      const available = ACTIVE_EXPRESSIONS.filter((e) => e !== currentExprRef.current);
      currentExprRef.current = available[Math.floor(Math.random() * available.length)];
    }

    if (cycleTime < 0.5) {
      // Transition from Neutral to Expression (0.5s)
      const p = cycleTime / 0.5;
      const t = easeInOutCubic(p);
      visorMgr.draw('neutral', currentExprRef.current, t);
    } else if (cycleTime < 2.0) {
      // Hold Expression (1.5s)
      visorMgr.draw(currentExprRef.current, currentExprRef.current, 1.0);
    } else if (cycleTime < 2.5) {
      // Transition back to Neutral (0.5s)
      const p = (cycleTime - 2.0) / 0.5;
      const t = easeInOutCubic(p);
      visorMgr.draw(currentExprRef.current, 'neutral', t);
    } else {
      // Neutral Face (4.5s)
      visorMgr.draw('neutral', 'neutral', 1.0);
    }
  });

  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={styledScene} scale={2.5} />
      </Center>
    </group>
  );
}

// Procedural 3D Robot Fallback with UV-Calibrated Visor Face
function ProceduralBot({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const headRef = useRef<THREE.Group>(null);
  const visorMgr = useMemo(() => new UVCalibratedVisorManager(), []);

  const currentExprRef = useRef<ExpressionType>('happy');
  const lastCycleRef = useRef<number>(-1);

  useFrame(({ clock }, delta) => {
    if (headRef.current) {
      const targetRotY = -Math.PI * 0.5 + mouseX * 0.4;
      const targetRotX = -mouseY * 0.25;
      headRef.current.rotation.y = THREE.MathUtils.damp(headRef.current.rotation.y, targetRotY, 5, delta);
      headRef.current.rotation.x = THREE.MathUtils.damp(headRef.current.rotation.x, targetRotX, 5, delta);
    }

    const cycleDuration = 7.0;
    const totalElapsed = clock.getElapsedTime();
    const cycleIndex = Math.floor(totalElapsed / cycleDuration);
    const cycleTime = totalElapsed % cycleDuration;

    if (cycleIndex > lastCycleRef.current) {
      lastCycleRef.current = cycleIndex;
      const available = ACTIVE_EXPRESSIONS.filter((e) => e !== currentExprRef.current);
      currentExprRef.current = available[Math.floor(Math.random() * available.length)];
    }

    if (cycleTime < 0.5) {
      const p = cycleTime / 0.5;
      const t = easeInOutCubic(p);
      visorMgr.draw('neutral', currentExprRef.current, t);
    } else if (cycleTime < 2.0) {
      visorMgr.draw(currentExprRef.current, currentExprRef.current, 1.0);
    } else if (cycleTime < 2.5) {
      const p = (cycleTime - 2.0) / 0.5;
      const t = easeInOutCubic(p);
      visorMgr.draw(currentExprRef.current, 'neutral', t);
    } else {
      visorMgr.draw('neutral', 'neutral', 1.0);
    }
  });

  return (
    <group ref={headRef}>
      {/* Head: Ivory */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.2, 0.9, 0.9]} />
        <meshStandardMaterial color="#F5F0E8" roughness={0.18} metalness={0.25} />
      </mesh>

      {/* Face Visor Plate (Aspect Ratio matched 5:4) */}
      <mesh position={[0, 0.42, 0.46]}>
        <planeGeometry args={[0.9, 0.72]} />
        <meshBasicMaterial map={visorMgr.texture} transparent opacity={0.98} />
      </mesh>

      {/* Earcups: Deep Red */}
      <mesh position={[-0.65, 0.4, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.15, 16]} />
        <meshStandardMaterial color="#D32F2F" roughness={0.2} metalness={0.45} />
      </mesh>
      <mesh position={[0.65, 0.4, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.15, 16]} />
        <meshStandardMaterial color="#D32F2F" roughness={0.2} metalness={0.45} />
      </mesh>

      {/* Shoulder Cups: Gold */}
      <mesh position={[-0.75, 0.05, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#C9A84C" roughness={0.25} metalness={0.85} />
      </mesh>
      <mesh position={[0.75, 0.05, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#C9A84C" roughness={0.25} metalness={0.85} />
      </mesh>

      {/* Body: Ivory */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.6, 0.8, 1, 32]} />
        <meshStandardMaterial color="#F5F0E8" roughness={0.18} metalness={0.25} />
      </mesh>

      {/* Chest Circle: Radial Teal/White */}
      <mesh position={[0, -0.4, 0.42]}>
        <circleGeometry args={[0.18, 32]} />
        <meshStandardMaterial color="#008080" emissive="#008080" emissiveIntensity={1.2} />
      </mesh>

      {/* Left Arm: Warm Silver */}
      <mesh position={[-0.75, -0.5, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 16]} />
        <meshStandardMaterial color="#B8C0C8" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Right Arm: Warm Silver */}
      <mesh position={[0.75, -0.5, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 16]} />
        <meshStandardMaterial color="#B8C0C8" roughness={0.2} metalness={0.8} />
      </mesh>
    </group>
  );
}

export const RobotScene: React.FC = () => {
  const { normX, normY } = useMousePosition();

  return (
    <div className="w-full h-full min-h-[380px] md:min-h-[460px] flex items-center justify-center select-none">
      <Canvas
        camera={{ position: [0, 0, 3.8], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        className="w-full h-full"
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[5, 8, 6]} intensity={2.0} color="#FFFFFF" />
        <directionalLight position={[-6, 3, -2]} intensity={1.4} color="#007AFF" />
        <directionalLight position={[0, -4, 4]} intensity={0.7} color="#C9A84C" />
        <pointLight position={[0, 1.5, 2.5]} intensity={1.5} color="#FFFFFF" />

        <PresentationControls
          global={false}
          cursor={true}
          speed={1.5}
          zoom={1}
          polar={[-0.2, 0.2]}
          azimuth={[-0.3, 0.3]}
        >
          <Float speed={2.2} rotationIntensity={0.12} floatIntensity={0.35}>
            <Suspense fallback={<ProceduralBot mouseX={normX} mouseY={normY} />}>
              <RobotModel mouseX={normX} mouseY={normY} />
            </Suspense>
          </Float>
        </PresentationControls>

        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.6}
          scale={5.5}
          blur={2.4}
          far={3.0}
          color="#000000"
        />
      </Canvas>
    </div>
  );
};
