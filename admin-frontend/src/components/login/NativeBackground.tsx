import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useMousePosition } from '../../hooks/useMousePosition';

// Animated flowing chromatic ribbon wave
function ChromaticRibbonWaves({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const count = 55; // Number of ribbon lines

  // Custom wave geometry
  const ribbons = useMemo(() => {
    const lines = [];
    for (let i = 0; i < count; i++) {
      const points = [];
      const segmentCount = 100;
      const yOffset = (i - count / 2) * 0.04;
      const zOffset = (i - count / 2) * 0.03;

      for (let j = 0; j <= segmentCount; j++) {
        const u = (j / segmentCount) * 2 - 1; // -1 to 1
        const x = u * 16;
        const y = yOffset;
        const z = zOffset;
        points.push(new THREE.Vector3(x, y, z));
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const geometry = new THREE.TubeGeometry(curve, 80, 0.016, 6, false);

      // Gradient color interpolation from violet/magenta to electric blue and cyan
      const progress = i / count;
      let color: THREE.Color;
      if (progress < 0.3) {
        color = new THREE.Color('#BF5AF2').lerp(new THREE.Color('#5856D6'), progress / 0.3);
      } else if (progress < 0.7) {
        color = new THREE.Color('#5856D6').lerp(new THREE.Color('#007AFF'), (progress - 0.3) / 0.4);
      } else {
        color = new THREE.Color('#007AFF').lerp(new THREE.Color('#00F0FF'), (progress - 0.7) / 0.3);
      }

      const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.85,
        roughness: 0.15,
        metalness: 0.9,
      });

      lines.push({ geometry, material });
    }
    return lines;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.8;
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.15 - 0.3;
      groupRef.current.rotation.z = Math.sin(t * 0.3) * 0.04 + mouseY * 0.02;
      groupRef.current.rotation.x = Math.cos(t * 0.4) * 0.05 + mouseX * 0.03;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.4, -2.5]}>
      {ribbons.map((ribbon, index) => (
        <primitive key={index} object={new THREE.Mesh(ribbon.geometry, ribbon.material)} />
      ))}
    </group>
  );
}

// Flowing 3D Header Text (CODE SIGHT + WELCOME ADMIN)
function HeaderText3D({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      const targetRotY = mouseX * 0.08;
      const targetRotX = -mouseY * 0.05;
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotY, 4, delta);
      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetRotX, 4, delta);
    }
  });

  return (
    <group ref={groupRef} position={[0, 2.4, -1]}>
      {/* CODE SIGHT Title */}
      <Text
        position={[0, 0.45, 0]}
        fontSize={0.72}
        letterSpacing={0.18}
        font="https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC0C4G-EiAou6Y.woff"
        anchorX="center"
        anchorY="middle"
      >
        CODE SIGHT
        <meshStandardMaterial
          color="#F2F5FA"
          roughness={0.15}
          metalness={0.8}
        />
      </Text>

      {/* WELCOME ADMIN Subtitle */}
      <Text
        position={[0, -0.15, 0]}
        fontSize={0.24}
        letterSpacing={0.22}
        font="https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC0C4G-EiAou6Y.woff"
        anchorX="center"
        anchorY="middle"
      >
        WELCOME ADMIN
        <meshStandardMaterial
          color="#94A3B8"
          roughness={0.2}
          metalness={0.5}
        />
      </Text>
    </group>
  );
}

// Ambient Floating Stars/Glow Nodes
function AmbientGlowParticles() {
  const count = 40;
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 12;
      const z = (Math.random() - 0.5) * 10 - 2;
      const scale = Math.random() * 0.04 + 0.015;
      temp.push({ position: [x, y, z] as [number, number, number], scale });
    }
    return temp;
  }, []);

  return (
    <group>
      {particles.map((p, i) => (
        <Float key={i} speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
          <mesh position={p.position} scale={p.scale}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial
              color="#00F0FF"
              emissive="#00F0FF"
              emissiveIntensity={3}
              roughness={0.1}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

export const NativeBackground: React.FC = () => {
  const { normX, normY } = useMousePosition();

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-auto select-none bg-[#08080A]">
      {/* Radial ambient background mesh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[5%] left-[20%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-[#007AFF]/15 via-[#BF5AF2]/10 to-transparent blur-[160px] animate-pulse-glow" />
        <div
          className="absolute bottom-[5%] right-[15%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tl from-[#007AFF]/18 via-[#30D158]/08 to-transparent blur-[180px] animate-pulse-glow"
          style={{ animationDelay: '1.8s' }}
        />
        <div className="absolute inset-0 opacity-[0.025] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* 100% Native Pure Three.js Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        className="w-full h-full"
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[0, 10, 10]} intensity={2.0} color="#FFFFFF" />
        <directionalLight position={[-10, 5, 2]} intensity={1.8} color="#BF5AF2" />
        <directionalLight position={[10, -5, 2]} intensity={1.8} color="#007AFF" />
        <pointLight position={[0, 2, 3]} intensity={2.0} color="#00F0FF" />

        {/* 3D Title Typography */}
        <HeaderText3D mouseX={normX} mouseY={normY} />

        {/* Flowing Animated Chromatic Ribbon Waves */}
        <ChromaticRibbonWaves mouseX={normX} mouseY={normY} />

        {/* Ambient Glowing Particles */}
        <AmbientGlowParticles />
      </Canvas>

      {/* Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_35%,#08080A_95%)] opacity-70" />
    </div>
  );
};
