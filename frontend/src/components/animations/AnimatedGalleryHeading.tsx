import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AnimatedGalleryHeadingProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function AnimatedGalleryHeading({
  title,
  subtitle,
  eyebrow,
  align = 'center',
  className = ''
}: AnimatedGalleryHeadingProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Background Noise / Ring Orbit Animation Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 200);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    let angle = 0;
    const render = () => {
      angle += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Orbital Rings
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.35;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle * 0.5);

      // Ring 1: Burnt Orange
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.4, radius * 0.4, Math.PI / 4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(201, 106, 50, 0.18)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Ring 2: Lavender Accent
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.2, radius * 0.5, -Math.PI / 3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(201, 167, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();

      frameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  const textAlign = align === 'left' ? 'text-left items-start' : 'text-center items-center';

  return (
    <div className={`relative overflow-hidden py-10 ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full pointer-events-none" />

      <div className={`relative z-10 flex flex-col ${textAlign} mx-auto max-w-5xl px-4`}>
        {eyebrow && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-3 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.25em] text-[#C96A32]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#C96A32]" />
            <span>{eyebrow}</span>
          </motion.div>
        )}

        <motion.h2
          initial={{ opacity: 0, y: 35, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-4xl font-extrabold tracking-tight text-[#F5EFE6] sm:text-6xl lg:text-7xl"
        >
          {title}
        </motion.h2>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 max-w-2xl text-sm leading-relaxed text-[#AAA2B5] sm:text-base"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </div>
  );
}
