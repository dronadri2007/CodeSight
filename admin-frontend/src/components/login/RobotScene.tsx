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

// 64-Bit High-Density Matrix (48 Columns x 64 Rows)
// 0 = Background, 1 = Neon Cyan (#00F0FF), 2 = Ice Highlight (#FFFFFF), 3 = Deep Cyan (#00889E)
type Matrix64Bit = number[][];

function parse64Bit(pattern: string[]): Matrix64Bit {
  return pattern.map((row) =>
    Array.from(row).map((char) => {
      if (char === '*') return 2;
      if (char === '+') return 3;
      if (char === '#') return 1;
      return 0;
    })
  );
}

function create64BitPattern(builder: (g: string[][]) => void): Matrix64Bit {
  const g: string[][] = Array.from({ length: 64 }, () => Array(48).fill('.'));
  builder(g);
  return parse64Bit(g.map((r) => r.join('')));
}

function drawRect64(g: string[][], r: number, c: number, h: number, w: number, char = '#') {
  for (let i = r; i < r + h; i++) {
    for (let j = c; j < c + w; j++) {
      if (i >= 0 && i < 64 && j >= 0 && j < 48) {
        g[i][j] = char;
      }
    }
  }
}

function drawCircle64(g: string[][], cr: number, cc: number, radius: number, char = '#', fill = true, highlight = false) {
  for (let r = 0; r < 64; r++) {
    for (let c = 0; c < 48; c++) {
      const d = Math.sqrt((r - cr) ** 2 + (c - cc) ** 2);
      if (fill) {
        if (d <= radius) {
          if (d >= radius - 1.0) {
            g[r][c] = '+';
          } else {
            g[r][c] = char;
          }
        }
      } else {
        if (radius - 1.8 <= d && d <= radius + 0.4) {
          g[r][c] = char;
        }
      }
    }
  }
  if (highlight && fill) {
    for (let dr = -2; dr <= 0; dr++) {
      for (let dc = -2; dc <= 0; dc++) {
        if (cr + dr >= 0 && cr + dr < 64 && cc + dc >= 0 && cc + dc < 48) {
          g[cr + dr][cc + dc] = '*';
        }
      }
    }
  }
}

// 64-Bit Pixel Art Expressions
const PIXEL_EXPRESSIONS_64BIT: Record<ExpressionType, Matrix64Bit> = {
  // f) Neutral (Resting): Two 16x16 high-res round eyes with dual-glint pupils + curved smile with dimples
  neutral: create64BitPattern((g) => {
    drawCircle64(g, 20, 12, 7.5, '#', true, true);
    drawCircle64(g, 20, 35, 7.5, '#', true, true);
    drawRect64(g, 44, 16, 4, 16, '#');
    drawRect64(g, 42, 14, 4, 2, '*');
    drawRect64(g, 42, 32, 4, 2, '*');
  }),

  // a) >.< (Playful Squint): High-density chevrons with anti-aliased edges + cute 64-bit smile
  squint: create64BitPattern((g) => {
    for (let i = 0; i < 10; i++) {
      g[15 + i][7 + i] = '#';
      g[15 + i][7 + i + 1] = '*';
      g[25 + i][16 - i] = '#';
      g[25 + i][16 - i + 1] = '*';

      g[15 + i][40 - i] = '#';
      g[15 + i][40 - i - 1] = '*';
      g[25 + i][31 + i] = '#';
      g[25 + i][31 + i - 1] = '*';
    }
    drawRect64(g, 45, 18, 4, 12, '#');
    drawRect64(g, 43, 16, 4, 2, '*');
    drawRect64(g, 43, 30, 4, 2, '*');
  }),

  // b) :O (Surprised): Two large 18x18 detailed open circles + large 16x16 open O mouth
  surprised: create64BitPattern((g) => {
    drawCircle64(g, 20, 12, 8.5, '#', false);
    drawCircle64(g, 20, 12, 6.0, '*', false);
    drawCircle64(g, 20, 35, 8.5, '#', false);
    drawCircle64(g, 20, 35, 6.0, '*', false);

    drawCircle64(g, 44, 24, 8.0, '#', false);
    drawCircle64(g, 44, 24, 5.5, '*', false);
  }),

  // c) ^_^ (Happy): Detailed curved chevron arches + wide 28px smile with dimples
  happy: create64BitPattern((g) => {
    for (let i = 0; i < 10; i++) {
      g[24 - i][7 + i] = '#';
      g[23 - i][7 + i] = '*';
      g[15 + i][16 + i] = '#';
      g[14 + i][16 + i] = '*';

      g[24 - i][31 + i] = '#';
      g[23 - i][31 + i] = '*';
      g[15 + i][40 + i] = '#';
      g[14 + i][40 + i] = '*';
    }
    drawRect64(g, 45, 10, 4, 28, '#');
    drawRect64(g, 43, 8, 4, 3, '*');
    drawRect64(g, 43, 37, 4, 3, '*');
  }),

  // d) ;) (Wink): Closed horizontal bar (16px) + Large open 16x16 eye with catchlight + Smirk
  wink: create64BitPattern((g) => {
    drawRect64(g, 20, 6, 4, 16, '#');
    drawRect64(g, 18, 6, 2, 16, '*');
    drawCircle64(g, 20, 35, 7.5, '#', true, true);
    drawRect64(g, 45, 16, 4, 16, '#');
    drawRect64(g, 41, 31, 4, 3, '*');
  }),

  // e) -_- (Suspicious): Twin 16px flat horizontal lines with top highlight + straight 20px mouth
  suspicious: create64BitPattern((g) => {
    drawRect64(g, 20, 6, 4, 16, '#');
    drawRect64(g, 18, 6, 2, 16, '*');
    drawRect64(g, 20, 26, 4, 16, '#');
    drawRect64(g, 18, 26, 2, 16, '*');
    drawRect64(g, 45, 14, 4, 20, '#');
  }),
};

// 64-Bit High-Density Visor Texture Manager
class Visor64BitManager {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;

  readonly COLS = 48;
  readonly ROWS = 64;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 512;
    this.canvas.height = 512;
    this.ctx = this.canvas.getContext('2d')!;

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.generateMipmaps = true;
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.magFilter = THREE.NearestFilter;

    this.texture.wrapS = THREE.ClampToEdgeWrapping;
    this.texture.wrapT = THREE.ClampToEdgeWrapping;
    this.texture.repeat.set(1, 1);
    this.texture.offset.set(0, 0);
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

    // Active Face Visor UV Coordinates on 512x512 Canvas (3.0px x 3.0px per pixel block)
    const cellSize = 3.0; // 100% Square in UV space
    const startX = Math.round(256 - (COLS * cellSize) / 2); // 184
    const startY = Math.round(252 - (ROWS * cellSize) / 2); // 156
    const gap = 0.4;
    const pixelSize = cellSize - gap; // 2.6px x 2.6px

    const fromGrid = PIXEL_EXPRESSIONS_64BIT[fromExpr];
    const toGrid = PIXEL_EXPRESSIONS_64BIT[toExpr];

    // Render 64-Bit High-Density Matrix (48x64)
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = Math.round(startX + c * cellSize);
        const y = Math.round(startY + r * cellSize);

        const valFrom = fromGrid[r][c];
        const valTo = toGrid[r][c];

        const intensity = (valFrom > 0 ? 1 : 0) * (1 - t) + (valTo > 0 ? 1 : 0) * t;
        const mode = t > 0.5 ? valTo : valFrom;

        if (intensity > 0.05) {
          // Soft Neon Glow Layer (#00F0FF)
          ctx.shadowColor = '#00F0FF';
          ctx.shadowBlur = 6 * intensity;

          if (mode === 2) {
            // Ice White Highlight (#FFFFFF / #80F7FF)
            ctx.fillStyle = `rgba(255, 255, 255, ${0.98 * intensity})`;
          } else if (mode === 3) {
            // Deep Cyan Accent (#00889E)
            ctx.fillStyle = `rgba(0, 160, 190, ${0.90 * intensity})`;
          } else {
            // Main Neon Cyan (#00F0FF)
            ctx.fillStyle = `rgba(0, 240, 255, ${0.95 * intensity})`;
          }
          ctx.fillRect(x, y, pixelSize, pixelSize);
        } else {
          // Unlit LED matrix dot
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(0, 240, 255, 0.025)';
          ctx.fillRect(x, y, pixelSize, pixelSize);
        }
      }
    }

    this.texture.needsUpdate = true;
  }
}

function RobotModel({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/assets/greeting_robot.glb');

  const visorMgr = useMemo(() => new Visor64BitManager(), []);

  // Expression State Tracking
  const currentExprRef = useRef<ExpressionType>('happy');
  const lastCycleRef = useRef<number>(-1);

  // Apply colors & 64-bit texture map
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

    // 6. 64-Bit High-Density Visor Material
    const faceVisorMat = new THREE.MeshBasicMaterial({
      map: visorMgr.texture,
      transparent: true,
      opacity: 0.99,
    });

    // Hide original 3D mouth, eyes, eyebrows meshes so ONLY the 64-bit pixel art appears
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

    // 2. 7-Second 64-Bit Animation Loop:
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

// Procedural 3D Robot Fallback with 64-Bit Visor Face
function ProceduralBot({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const headRef = useRef<THREE.Group>(null);
  const visorMgr = useMemo(() => new Visor64BitManager(), []);

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

      {/* Face Visor Plate */}
      <mesh position={[0, 0.42, 0.46]}>
        <planeGeometry args={[0.9, 0.9]} />
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
