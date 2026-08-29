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

// 2D Canvas Texture Face Renderer calibrated to exact UV mapping of robot face visor
class FaceTextureManager {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 512;
    this.canvas.height = 512;
    this.ctx = this.canvas.getContext('2d')!;

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.generateMipmaps = true;
    this.texture.minFilter = THREE.LinearMipmapLinearFilter;
    // Align canvas Y directly with mesh UV V coordinate (Forehead = Top, Chin = Bottom)
    this.texture.flipY = false;

    this.draw('neutral', 'neutral', 1);
  }

  // Draw face expressions at exact UV-mapped pixel coordinates
  draw(fromExpr: ExpressionType, toExpr: ExpressionType, t: number) {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    // Clear background to deep obsidian black visor color
    ctx.fillStyle = '#101217';
    ctx.fillRect(0, 0, w, h);

    const renderFace = (expr: ExpressionType, alpha: number) => {
      if (alpha <= 0.001) return;

      ctx.save();
      ctx.globalAlpha = alpha;

      // Glow & Styling for Eyes & Mouth
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#00F0FF';
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 7.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // UV-Calibrated Coordinate Anchors:
      // Left Eye: X = 288, Y = 222
      // Right Eye: X = 224, Y = 222
      // Mouth Center: X = 256, Y = 312
      const leftEyeX = 288;
      const rightEyeX = 224;
      const eyeY = 222;
      const mouthX = 256;
      const mouthY = 312;

      switch (expr) {
        // Neutral (Default friendly resting face)
        case 'neutral': {
          // Left Eye (Round)
          ctx.beginPath();
          ctx.arc(leftEyeX, eyeY, 13, 0, Math.PI * 2);
          ctx.fill();

          // Right Eye (Round)
          ctx.beginPath();
          ctx.arc(rightEyeX, eyeY, 13, 0, Math.PI * 2);
          ctx.fill();

          // Gentle Smile
          ctx.beginPath();
          ctx.arc(mouthX, mouthY - 8, 16, Math.PI * 0.2, Math.PI * 0.8);
          ctx.stroke();
          break;
        }

        // 1. >.< (Playful Squint)
        case 'squint': {
          // Left Chevron (< on UV for viewer left)
          ctx.beginPath();
          ctx.moveTo(leftEyeX + 13, eyeY - 10);
          ctx.lineTo(leftEyeX - 9, eyeY);
          ctx.lineTo(leftEyeX + 13, eyeY + 10);
          ctx.stroke();

          // Right Chevron (> on UV for viewer right)
          ctx.beginPath();
          ctx.moveTo(rightEyeX - 13, eyeY - 10);
          ctx.lineTo(rightEyeX + 9, eyeY);
          ctx.lineTo(rightEyeX - 13, eyeY + 10);
          ctx.stroke();

          // Small Smile
          ctx.beginPath();
          ctx.arc(mouthX, mouthY - 6, 12, Math.PI * 0.15, Math.PI * 0.85);
          ctx.stroke();
          break;
        }

        // 2. :O (Surprised)
        case 'surprised': {
          // Left Eye (Wide Open)
          ctx.beginPath();
          ctx.arc(leftEyeX, eyeY, 18, 0, Math.PI * 2);
          ctx.fill();

          // Right Eye (Wide Open)
          ctx.beginPath();
          ctx.arc(rightEyeX, eyeY, 18, 0, Math.PI * 2);
          ctx.fill();

          // Open 'O' Mouth
          ctx.beginPath();
          ctx.ellipse(mouthX, mouthY, 10, 14, 0, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }

        // 3. ^_^ (Happy)
        case 'happy': {
          // Left Eye (Curved Upward Arc)
          ctx.beginPath();
          ctx.arc(leftEyeX, eyeY + 8, 18, Math.PI * 1.15, Math.PI * 1.85);
          ctx.stroke();

          // Right Eye (Curved Upward Arc)
          ctx.beginPath();
          ctx.arc(rightEyeX, eyeY + 8, 18, Math.PI * 1.15, Math.PI * 1.85);
          ctx.stroke();

          // Wide Cheerful Smile
          ctx.beginPath();
          ctx.arc(mouthX, mouthY - 10, 22, Math.PI * 0.15, Math.PI * 0.85);
          ctx.stroke();
          break;
        }

        // 4. ;) (Wink)
        case 'wink': {
          // Left Eye (Closed Horizontal Wink Line)
          ctx.beginPath();
          ctx.moveTo(leftEyeX - 15, eyeY);
          ctx.lineTo(leftEyeX + 15, eyeY);
          ctx.stroke();

          // Right Eye (Open Circle)
          ctx.beginPath();
          ctx.arc(rightEyeX, eyeY, 14, 0, Math.PI * 2);
          ctx.fill();

          // Cheeky Smirk Mouth
          ctx.beginPath();
          ctx.moveTo(mouthX - 16, mouthY + 3);
          ctx.quadraticCurveTo(mouthX, mouthY + 8, mouthX + 18, mouthY - 5);
          ctx.stroke();
          break;
        }

        // 5. -_- (Suspicious)
        case 'suspicious': {
          // Left Eye (Flat Slit Line)
          ctx.beginPath();
          ctx.moveTo(leftEyeX - 18, eyeY);
          ctx.lineTo(leftEyeX + 18, eyeY);
          ctx.stroke();

          // Right Eye (Flat Slit Line)
          ctx.beginPath();
          ctx.moveTo(rightEyeX - 18, eyeY);
          ctx.lineTo(rightEyeX + 18, eyeY);
          ctx.stroke();

          // Calm Horizontal Flat Mouth
          ctx.beginPath();
          ctx.moveTo(mouthX - 16, mouthY);
          ctx.lineTo(mouthX + 16, mouthY);
          ctx.stroke();
          break;
        }
      }

      ctx.restore();
    };

    if (t <= 0) {
      renderFace(fromExpr, 1.0);
    } else if (t >= 1) {
      renderFace(toExpr, 1.0);
    } else {
      // Smooth crossfade between expressions
      renderFace(fromExpr, 1.0 - t);
      renderFace(toExpr, t);
    }

    this.texture.needsUpdate = true;
  }
}

function RobotModel({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/assets/greeting_robot.glb');

  const faceTextureMgr = useMemo(() => new FaceTextureManager(), []);

  // Expression State Tracking
  const currentExprRef = useRef<ExpressionType>('happy');
  const lastCycleRef = useRef<number>(-1);

  // Apply colors & 2D canvas texture map to the face surface
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

    // 6. Texture-based Face Visor Material (Canvas Texture)
    const faceVisorMat = new THREE.MeshBasicMaterial({
      map: faceTextureMgr.texture,
      transparent: true,
      opacity: 0.99,
    });

    // Hide original 3D mouth, eyes, eyebrows meshes so ONLY the canvas texture appears
    cloned.traverse((child) => {
      const name = (child.name || '').toLowerCase();
      const parentName = (child.parent?.name || '').toLowerCase();
      const fullName = `${name} ${parentName}`;

      // Completely remove/hide original 3D mouth, eye, and eyebrow meshes
      if (
        fullName.includes('mouth') ||
        fullName.includes('eyebrow') ||
        fullName.includes('brow') ||
        (fullName.includes('eye') && !fullName.includes('head_2'))
      ) {
        child.visible = false;
        child.scale.set(0, 0, 0); // Guarantee zero 3D protrusion
      }

      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (name.includes('head_2')) {
          // Apply 2D canvas texture directly to the clean face visor plate
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
  }, [scene, faceTextureMgr]);

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

    // 2. 7-Second Texture-Based Expression Cycle:
    // - 0.0s - 0.5s: Smooth transition to random expression
    // - 0.5s - 2.0s: Hold expression (1.5s)
    // - 2.0s - 2.5s: Smooth transition back to neutral
    // - 2.5s - 7.0s: Neutral face (4.5s)
    const cycleDuration = 7.0;
    const totalElapsed = clock.getElapsedTime();
    const cycleIndex = Math.floor(totalElapsed / cycleDuration);
    const cycleTime = totalElapsed % cycleDuration;

    // Pick a new random expression on each 7-second boundary (no back-to-back repeats)
    if (cycleIndex > lastCycleRef.current) {
      lastCycleRef.current = cycleIndex;
      const available = ACTIVE_EXPRESSIONS.filter((e) => e !== currentExprRef.current);
      currentExprRef.current = available[Math.floor(Math.random() * available.length)];
    }

    if (cycleTime < 0.5) {
      // Transition from Neutral to Expression (0.5s)
      const p = cycleTime / 0.5;
      const t = easeInOutCubic(p);
      faceTextureMgr.draw('neutral', currentExprRef.current, t);
    } else if (cycleTime < 2.0) {
      // Hold Expression (1.5s)
      faceTextureMgr.draw(currentExprRef.current, currentExprRef.current, 1.0);
    } else if (cycleTime < 2.5) {
      // Transition back to Neutral (0.5s)
      const p = (cycleTime - 2.0) / 0.5;
      const t = easeInOutCubic(p);
      faceTextureMgr.draw(currentExprRef.current, 'neutral', t);
    } else {
      // Neutral Face (4.5s)
      faceTextureMgr.draw('neutral', 'neutral', 1.0);
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

// Procedural 3D Robot Fallback with Clean Visor
function ProceduralBot({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const headRef = useRef<THREE.Group>(null);
  const faceTextureMgr = useMemo(() => new FaceTextureManager(), []);

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
      faceTextureMgr.draw('neutral', currentExprRef.current, t);
    } else if (cycleTime < 2.0) {
      faceTextureMgr.draw(currentExprRef.current, currentExprRef.current, 1.0);
    } else if (cycleTime < 2.5) {
      const p = (cycleTime - 2.0) / 0.5;
      const t = easeInOutCubic(p);
      faceTextureMgr.draw(currentExprRef.current, 'neutral', t);
    } else {
      faceTextureMgr.draw('neutral', 'neutral', 1.0);
    }
  });

  return (
    <group ref={headRef}>
      {/* Head: Ivory */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.2, 0.9, 0.9]} />
        <meshStandardMaterial color="#F5F0E8" roughness={0.18} metalness={0.25} />
      </mesh>

      {/* Face Visor Plate with 2D Canvas Texture (No overlapping 3D eye/mouth boxes) */}
      <mesh position={[0, 0.42, 0.46]}>
        <planeGeometry args={[0.9, 0.48]} />
        <meshBasicMaterial map={faceTextureMgr.texture} transparent opacity={0.98} />
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
