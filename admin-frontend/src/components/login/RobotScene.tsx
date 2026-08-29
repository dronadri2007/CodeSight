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

// 12-Bit / Retro LED Matrix Bitmap Definitions (24 columns x 16 rows)
// 1 = Active glowing LED, 0 = Inactive LED
type MatrixGrid = number[][];

const createEmptyGrid = (cols = 24, rows = 16): MatrixGrid =>
  Array.from({ length: rows }, () => Array(cols).fill(0));

// Helper to set pixel blocks easily
function buildMatrix(pattern: string[]): MatrixGrid {
  const grid = createEmptyGrid(24, 16);
  pattern.forEach((rowStr, r) => {
    if (r < 16) {
      for (let c = 0; c < Math.min(24, rowStr.length); c++) {
        grid[r][c] = rowStr[c] === '#' ? 1 : 0;
      }
    }
  });
  return grid;
}

// 12-Bit Pixel Matrix Expressions (Left Eye: Cols 14-20, Right Eye: Cols 3-9, Mouth: Cols 8-15)
const PIXEL_EXPRESSIONS: Record<ExpressionType, MatrixGrid> = {
  // Neutral: Clean round pixel pupils + gentle smile
  neutral: buildMatrix([
    "........................",
    "........................",
    "....####........####....",
    "...######......######...",
    "...######......######...",
    "....####........####....",
    "........................",
    "........................",
    "........................",
    "........................",
    ".......##########.......",
    "........########........",
    "........................",
    "........................",
    "........................",
    "........................",
  ]),

  // 1. >.< (Playful Squint)
  squint: buildMatrix([
    "........................",
    "........................",
    "...##..............##...",
    "....##............##....",
    ".....##..........##.....",
    "....##............##....",
    "...##..............##...",
    "........................",
    "........................",
    "........................",
    "........########........",
    ".........######.........",
    "..........####..........",
    "........................",
    "........................",
    "........................",
  ]),

  // 2. :O (Surprised)
  surprised: buildMatrix([
    "........................",
    "....######....######....",
    "...##....##..##....##...",
    "...##....##..##....##...",
    "...##....##..##....##...",
    "....######....######....",
    "........................",
    "........................",
    ".........######.........",
    "........##....##........",
    "........##....##........",
    ".........######.........",
    "........................",
    "........................",
    "........................",
    "........................",
  ]),

  // 3. ^_^ (Happy)
  happy: buildMatrix([
    "........................",
    ".....####......####.....",
    "....######....######....",
    "...##....##..##....##...",
    "........................",
    "........................",
    "........................",
    "........................",
    "........................",
    "......############......",
    ".......##########.......",
    "........########........",
    "........................",
    "........................",
    "........................",
    "........................",
  ]),

  // 4. ;) (Wink)
  wink: buildMatrix([
    "........................",
    "........................",
    "................####....",
    "...########....######...",
    "...............######...",
    "................####....",
    "........................",
    "........................",
    "........................",
    "........########........",
    "..........########......",
    "............####........",
    "........................",
    "........................",
    "........................",
    "........................",
  ]),

  // 5. -_- (Suspicious)
  suspicious: buildMatrix([
    "........................",
    "........................",
    "........................",
    "...########..########...",
    "...########..########...",
    "........................",
    "........................",
    "........................",
    "........................",
    "........................",
    "........########........",
    "........................",
    "........................",
    "........................",
    "........................",
    "........................",
  ]),
};

// 12-Bit Dynamic Canvas LED Matrix Texture Manager
class PixelMatrixFaceManager {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;

  readonly COLS = 24;
  readonly ROWS = 16;

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
    const { ctx, canvas, COLS, ROWS } = this;
    const w = canvas.width;
    const h = canvas.height;

    // Clear background to deep obsidian visor screen
    ctx.fillStyle = '#0B0D12';
    ctx.fillRect(0, 0, w, h);

    // Active Face UV Mapping Box on 512x512 Canvas:
    // U in [192, 320] (Width = 128 px)
    // V in [128, 384] (Height = 256 px)
    const startX = 188;
    const startY = 175;
    const boxW = 136;
    const boxH = 170;

    const pixelW = boxW / COLS;
    const pixelH = boxH / ROWS;
    const gap = 1.2;

    const fromGrid = PIXEL_EXPRESSIONS[fromExpr];
    const toGrid = PIXEL_EXPRESSIONS[toExpr];

    // Render 12-bit LED Matrix Grid
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = startX + c * pixelW;
        const y = startY + r * pixelH;
        const pw = pixelW - gap;
        const ph = pixelH - gap;

        const valFrom = fromGrid[r][c];
        const valTo = toGrid[r][c];

        // Interpolated LED brightness (0.0 to 1.0)
        const intensity = valFrom * (1 - t) + valTo * t;

        if (intensity > 0.05) {
          // Lit LED pixel with cyan phosphor glow
          ctx.shadowColor = '#00F0FF';
          ctx.shadowBlur = 8 * intensity;

          // Outer LED
          ctx.fillStyle = `rgba(0, 240, 255, ${0.85 * intensity})`;
          ctx.fillRect(x, y, pw, ph);

          // Bright Core Pixel
          ctx.fillStyle = `rgba(220, 255, 255, ${0.95 * intensity})`;
          ctx.fillRect(x + pw * 0.2, y + ph * 0.2, pw * 0.6, ph * 0.6);
        } else {
          // Unlit LED pixel grid dot (subtle dark matrix texture)
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(0, 240, 255, 0.04)';
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

  const matrixFaceMgr = useMemo(() => new PixelMatrixFaceManager(), []);

  // Expression State Tracking
  const currentExprRef = useRef<ExpressionType>('happy');
  const lastCycleRef = useRef<number>(-1);

  // Apply colors & 12-bit pixel matrix texture map
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

    // 6. 12-Bit Retro LED Matrix Face Material
    const faceVisorMat = new THREE.MeshBasicMaterial({
      map: matrixFaceMgr.texture,
      transparent: true,
      opacity: 0.99,
    });

    // Hide original 3D mouth, eyes, eyebrows meshes so ONLY the pixel matrix appears
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
          // Apply 12-Bit LED Matrix texture directly to front face visor
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
  }, [scene, matrixFaceMgr]);

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

    // 2. 7-Second 12-Bit Expression Loop:
    // - 0.0s - 0.5s: Smooth pixel transition to random expression
    // - 0.5s - 2.0s: Hold pixel expression (1.5s)
    // - 2.0s - 2.5s: Smooth pixel transition back to neutral
    // - 2.5s - 7.0s: Neutral pixel face (4.5s)
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
      matrixFaceMgr.draw('neutral', currentExprRef.current, t);
    } else if (cycleTime < 2.0) {
      // Hold Expression (1.5s)
      matrixFaceMgr.draw(currentExprRef.current, currentExprRef.current, 1.0);
    } else if (cycleTime < 2.5) {
      // Transition back to Neutral (0.5s)
      const p = (cycleTime - 2.0) / 0.5;
      const t = easeInOutCubic(p);
      matrixFaceMgr.draw(currentExprRef.current, 'neutral', t);
    } else {
      // Neutral Face (4.5s)
      matrixFaceMgr.draw('neutral', 'neutral', 1.0);
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

// Procedural 3D Robot Fallback with 12-Bit Pixel Matrix Face
function ProceduralBot({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const headRef = useRef<THREE.Group>(null);
  const matrixFaceMgr = useMemo(() => new PixelMatrixFaceManager(), []);

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
      matrixFaceMgr.draw('neutral', currentExprRef.current, t);
    } else if (cycleTime < 2.0) {
      matrixFaceMgr.draw(currentExprRef.current, currentExprRef.current, 1.0);
    } else if (cycleTime < 2.5) {
      const p = (cycleTime - 2.0) / 0.5;
      const t = easeInOutCubic(p);
      matrixFaceMgr.draw(currentExprRef.current, 'neutral', t);
    } else {
      matrixFaceMgr.draw('neutral', 'neutral', 1.0);
    }
  });

  return (
    <group ref={headRef}>
      {/* Head: Ivory */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.2, 0.9, 0.9]} />
        <meshStandardMaterial color="#F5F0E8" roughness={0.18} metalness={0.25} />
      </mesh>

      {/* Face Visor Plate with 12-Bit LED Matrix */}
      <mesh position={[0, 0.42, 0.46]}>
        <planeGeometry args={[0.9, 0.48]} />
        <meshBasicMaterial map={matrixFaceMgr.texture} transparent opacity={0.98} />
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
