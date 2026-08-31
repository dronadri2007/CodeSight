import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CodeSightIntroProps {
  onComplete: () => void;
}

export function CodeSightIntro({ onComplete }: CodeSightIntroProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stage, setStage] = useState<number>(0); // 0: Init, 1: CODESIGHT, 2: TRAIN YOUR EYE FOR CODE, 3: Transition

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 200);
    const timer2 = setTimeout(() => setStage(2), 1800);
    const timer3 = setTimeout(() => setStage(3), 3600);
    const timer4 = setTimeout(() => onComplete(), 4200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  // Particle & Shader Grid Canvas Effect in Warm Paper Tones
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Array<{ x: number; y: number; vx: number; vy: number; radius: number; alpha: number }> = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 1.8 + 0.6,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    let time = 0;
    const render = () => {
      time += 0.015;
      ctx.fillStyle = '#F8F5EC';
      ctx.fillRect(0, 0, width, height);

      // Radial Ambient Glow
      const glow = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width / 1.2);
      glow.addColorStop(0, 'rgba(242, 238, 227, 0.9)');
      glow.addColorStop(0.5, 'rgba(237, 231, 215, 0.5)');
      glow.addColorStop(1, 'rgba(248, 245, 236, 0.95)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      // Grid Lines
      ctx.strokeStyle = 'rgba(216, 208, 192, 0.4)';
      ctx.lineWidth = 1;
      const gridSize = 48;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Particles & Connections
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(116, 109, 97, ${p.alpha})`;
        ctx.fill();

        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(216, 208, 192, ${0.4 * (1 - dist / 110)})`;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[999999] pointer-events-auto flex items-center justify-center overflow-hidden bg-[#F8F5EC] text-[#17130F]">
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <AnimatePresence mode="wait">
          {stage >= 1 && stage < 3 && (
            <motion.div
              key="intro-stage"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 1.05 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center justify-center"
            >
              {/* Brand Emblem */}
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#D8D0C0] bg-[#F5F1E7] shadow-sm">
                <span className="font-mono text-2xl font-bold tracking-tighter text-[#17130F]">&lt;/&gt;</span>
              </div>

              {/* CODESIGHT Assembly */}
              <motion.h1
                initial={{ letterSpacing: '0.3em', filter: 'blur(8px)' }}
                animate={{ letterSpacing: '0.05em', filter: 'blur(0px)' }}
                transition={{ duration: 1.0, ease: 'easeOut' }}
                className="font-serif text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl text-[#17130F]"
              >
                CODESIGHT
              </motion.h1>

              {/* Tagline Assembly */}
              {stage >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="mt-6 flex flex-col items-center gap-3"
                >
                  <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#D8D0C0] to-transparent" />
                  <p className="font-mono text-sm font-semibold uppercase tracking-[0.25em] text-[#403A32] sm:text-base">
                    Train Your Eye For Code.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#E5DFD1]">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 4.0, ease: 'linear' }}
          className="h-full bg-[#17130F]"
        />
      </div>
    </div>
  );
}
