import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowRight, Zap, Sparkles, Shield, Trophy } from 'lucide-react';

interface LiquidMetalCTAProps {
  text: string;
  onClick?: () => void;
  icon?: 'play' | 'arrow' | 'zap' | 'sparkles' | 'shield' | 'trophy';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LiquidMetalCTA({
  text,
  onClick,
  icon = 'play',
  size = 'md',
  className = ''
}: LiquidMetalCTAProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Tactile Canvas Surface Wave Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 240);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 60);

    let time = 0;
    const render = () => {
      time += isHovered ? 0.03 : 0.01;
      ctx.clearRect(0, 0, width, height);

      // Dark Ink Metallic Gradient Surface
      const grad = ctx.createLinearGradient(0, 0, width, height);

      if (isHovered) {
        grad.addColorStop(0, '#403A32');
        grad.addColorStop(0.5, '#17130F');
        grad.addColorStop(1, '#403A32');
      } else {
        grad.addColorStop(0, '#17130F');
        grad.addColorStop(0.5, '#26201A');
        grad.addColorStop(1, '#17130F');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(0, 0, width, height, height / 2);
      ctx.fill();

      // Tactile Wave Highlight
      ctx.fillStyle = 'rgba(248, 245, 236, 0.08)';
      ctx.beginPath();
      for (let x = 0; x < width; x += 10) {
        const y = Math.sin(x * 0.04 + time * 2.5) * 4 + height / 2;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isHovered]);

  const sizeClasses = {
    sm: 'px-5 py-2.5 text-xs font-mono font-bold',
    md: 'px-7 py-3.5 text-sm font-mono font-bold',
    lg: 'px-9 py-4 text-base font-mono font-extrabold'
  }[size];

  const IconComp = {
    play: Play,
    arrow: ArrowRight,
    zap: Zap,
    sparkles: Sparkles,
    shield: Shield,
    trophy: Trophy
  }[icon];

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98, y: 1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full border border-[#17130F] shadow-sm transition-all duration-200 text-[#F8F5EC] bg-[#17130F] ${sizeClasses} ${className}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full pointer-events-none" />

      <span className="relative z-10 uppercase tracking-wider">{text}</span>
      <IconComp size={size === 'lg' ? 18 : 15} className="relative z-10 text-[#F8F5EC]" />
    </motion.button>
  );
}
