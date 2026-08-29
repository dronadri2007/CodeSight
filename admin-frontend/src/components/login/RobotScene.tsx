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

// 32x32 Pixel Art Matrix Definition (32 Columns x 32 Rows)
// 0 = Background, 1 = Bright Cyan (#00F0FF), 2 = Highlight Lighter Cyan (#66F5FF)
type Matrix32 = number[][];

function parse32x32(pattern: string[]): Matrix32 {
  return pattern.map((row) =>
    Array.from(row).map((char) => {
      if (char === '*') return 2;
      if (char === '#') return 1;
      return 0;
    })
  );
}

function create32Pattern(builder: (g: string[][]) => void): Matrix32 {
  const g: string[][] = Array.from({ length: 32 }, () => Array(32).fill('.'));
  builder(g);
  return parse32x32(g.map((r) => r.join('')));
}

function drawRect32(g: string[][], r: number, c: number, h: number, w: number, char = '#') {
  for (let i = r; i < r + h; i++) {
    for (let j = c; j < c + w; j++) {
      if (i >= 0 && i < 32 && j >= 0 && j < 32) {
        g[i][j] = char;
      }
    }
  }
}

function drawCircle32(g: string[][], cr: number, cc: number, radius: number, char = '#', fill = true, highlight = false) {
  for (let r = 0; r < 32; r++) {
    for (let c = 0; c < 32; c++) {
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

// 32x32 Full-Visor Coverage Expressions
const PIXEL_EXPRESSIONS_32X32: Record<ExpressionType, Matrix32> = {
  // f) Neutral (Resting): Two 10x10 detailed rounded eyes + 16px wide smile with dimples
  neutral: create32Pattern((g) => {
    drawCircle32(g, 10, 8, 4.5, '#', true, true);
    drawCircle32(g, 10, 23, 4.5, '#', true, true);
    drawRect32(g, 22, 10, 2, 12, '#');
    drawRect32(g, 21, 9, 2, 2, '*');
    drawRect32(g, 21, 21, 2, 2, '*');
  }),

  // a) >.< (Playful Squint): Full-sized angled downward chevrons + cute open smile
  squint: create32Pattern((g) => {
    for (let i = 0; i < 6; i++) {
      g[7 + i][4 + i] = '#';
      g[7 + i][4 + i + 1] = '*';
      g[12 + i][9 - i] = '#';
      g[12 + i][9 - i + 1] = '*';

      g[7 + i][27 - i] = '#';
      g[7 + i][27 - i - 1] = '*';
      g[12 + i][22 + i] = '#';
      g[12 + i][22 + i - 1] = '*';
    }
    drawRect32(g, 23, 11, 2, 10, '#');
    drawRect32(g, 22, 10, 2, 2, '*');
    drawRect32(g, 22, 20, 2, 2, '*');
  }),

  // b) :O (Surprised): Large 12x12 dual-layer circles + large 14x12 open O mouth
  surprised: create32Pattern((g) => {
    drawCircle32(g, 10, 8, 5.5, '#', false);
    drawCircle32(g, 10, 8, 4.0, '*', false);
    drawCircle32(g, 10, 23, 5.5, '#', false);
    drawCircle32(g, 10, 23, 4.0, '*', false);

    drawCircle32(g, 22, 16, 5.0, '#', false);
    drawCircle32(g, 22, 16, 3.5, '*', false);
  }),

  // c) ^_^ (Happy): Large 12px chevron arches + full 20px wide smile with dimples
  happy: create32Pattern((g) => {
    for (let i = 0; i < 7; i++) {
      g[13 - i][3 + i] = '#';
      g[12 - i][3 + i] = '*';
      g[7 + i][9 + i] = '#';
      g[6 + i][9 + i] = '*';

      g[13 - i][18 + i] = '#';
      g[12 - i][18 + i] = '*';
      g[7 + i][24 + i] = '#';
      g[6 + i][24 + i] = '*';
    }
    drawRect32(g, 23, 6, 2, 20, '#');
    drawRect32(g, 22, 5, 2, 2, '*');
    drawRect32(g, 22, 25, 2, 2, '*');
  }),

  // d) ;) (Wink): Closed horizontal bar (14px) + Large open 10x10 eye with catchlight + Smirk
  wink: create32Pattern((g) => {
    drawRect32(g, 10, 2, 2, 13, '#');
    drawRect32(g, 9, 2, 1, 13, '*');
    drawCircle32(g, 10, 23, 4.5, '#', true, true);
    drawRect32(g, 23, 10, 2, 12, '#');
    drawRect32(g, 21, 21, 2, 2, '*');
  }),

  // e) -_- (Suspicious): Twin 14px flat horizontal lines with top highlight + straight 14px mouth
  suspicious: create32Pattern((g) => {
    drawRect32(g, 10, 2, 2, 13, '#');
    drawRect32(g, 9, 2, 1, 13, '*');
    drawRect32(g, 10, 17, 2, 13, '#');
    drawRect32(g, 9, 17, 1, 13, '*');
    drawRect32(g, 23, 9, 2, 14, '#');
  }),
};

// 32x32 Full-Visor Pixel Art Texture Manager
class FullVisorPixelManager {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;

  readonly GRID_SIZE = 32;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 512;
    this.canvas.height = 512;
    this.ctx = this.canvas.getContext('2d')!;

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.generateMipmaps = true;
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.flipY = false;

    this.draw('neutral', 'neutral', 1);
  }

  draw(fromExpr: ExpressionType, toExpr: ExpressionType, t: number) {
    const { ctx, canvas, GRID_SIZE } = this;
    const w = canvas.width;
    const h = canvas.height;

    // Deep Dark Visor Background (#0A0A0F) filling full canvas
    ctx.fillStyle = '#0A0A0F';
    ctx.fillRect(0, 0, w, h);

    // Full-Screen Visor Spacing (Edge-to-edge across the entire screen area)
    const padding = 16;
    const availableW = w - padding * 2;
    const availableH = h - padding * 2;

    const cellW = availableW / GRID_SIZE;
    const cellH = availableH / GRID_SIZE;
    const gap = 1.0;

    const fromGrid = PIXEL_EXPRESSIONS_32X32[fromExpr];
    const toGrid = PIXEL_EXPRESSIONS_32X32[toExpr];

    // Render 32x32 Pixel Grid across entire visor
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const x = Math.round(padding + c * cellW);
        const y = Math.round(padding + r * cellH);
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
          // Unlit LED pixel grid dot (subtle physical matrix texture)
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

  const pixelMgr = useMemo(() => new FullVisorPixelManager(), []);

  // Expression State Tracking
  const currentExprRef = useRef<ExpressionType>('happy');
  const lastCycleRef = useRef<number>(-1);

  // Apply colors & full-visor UV remapped texture
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

    // 6. Full-Visor Pixel Art Material
    const faceVisorMat = new THREE.MeshBasicMaterial({
      map: pixelMgr.texture,
      transparent: true,
      opacity: 0.99,
    });

    // Hide original 3D mouth, eyes, eyebrows meshes so ONLY the pixel art appears
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
          // Clone geometry and remap UV coordinates so the texture covers the FULL VISOR area
          const geom = mesh.geometry.clone();
          mesh.geometry = geom;
          const uvAttr = geom.attributes.uv;
          if (uvAttr) {
            for (let i = 0; i < uvAttr.count; i++) {
              const u = uvAttr.getX(i);
              const v = uvAttr.getY(i);
              // Normalize U from [0.25, 0.78125] to [0, 1] across the entire visor
              const normalizedU = Math.min(1, Math.max(0, (u - 0.25) / (0.78125 - 0.25)));
              uvAttr.setXY(i, normalizedU, v);
            }
            uvAttr.needsUpdate = true;
          }
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
  }, [scene, pixelMgr]);

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

    // 2. 7-Second 32x32 Pixel Art Animation Loop:
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
      pixelMgr.draw('neutral', currentExprRef.current, t);
    } else if (cycleTime < 2.0) {
      // Hold Expression (1.5s)
      pixelMgr.draw(currentExprRef.current, currentExprRef.current, 1.0);
    } else if (cycleTime < 2.5) {
      // Transition back to Neutral (0.5s)
      const p = (cycleTime - 2.0) / 0.5;
      const t = easeInOutCubic(p);
      pixelMgr.draw(currentExprRef.current, 'neutral', t);
    } else {
      // Neutral Face (4.5s)
      pixelMgr.draw('neutral', 'neutral', 1.0);
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

// Procedural 3D Robot Fallback with Full-Visor 32x32 Pixel Art Face
function ProceduralBot({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const headRef = useRef<THREE.Group>(null);
  const pixelMgr = useMemo(() => new FullVisorPixelManager(), []);

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
      pixelMgr.draw('neutral', currentExprRef.current, t);
    } else if (cycleTime < 2.0) {
      pixelMgr.draw(currentExprRef.current, currentExprRef.current, 1.0);
    } else if (cycleTime < 2.5) {
      const p = (cycleTime - 2.0) / 0.5;
      const t = easeInOutCubic(p);
      pixelMgr.draw(currentExprRef.current, 'neutral', t);
    } else {
      pixelMgr.draw('neutral', 'neutral', 1.0);
    }
  });

  return (
    <group ref={headRef}>
      {/* Head: Ivory */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.2, 0.9, 0.9]} />
        <meshStandardMaterial color="#F5F0E8" roughness={0.18} metalness={0.25} />
      </mesh>

      {/* Face Visor Plate with Full 32x32 Pixel Art */}
      <mesh position={[0, 0.42, 0.46]}>
        <planeGeometry args={[0.9, 0.48]} />
        <meshBasicMaterial map={pixelMgr.texture} transparent opacity={0.98} />
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
