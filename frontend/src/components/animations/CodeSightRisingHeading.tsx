import React, { useEffect, useRef, useState } from 'react';

interface CodeSightRisingHeadingProps {
  text?: string;
  subtext?: string;
  className?: string;
}

/* 
 * CodeSight Native Implementation of GalleryHeading "rising-diagonal" (Matte Rise)
 * - 12 Museum Plates in slow 3D orbit
 * - Spring-driven momentum ring physics (K=26, D=5.7) with natural overshoot
 * - Procedural noise & fine grain field
 * - Light sans wide-tracked editorial typography: "TRAIN YOUR EYE FOR CODE"
 * - CodeSight Warm Editorial Palette (#F8F5EC, #F5F1E7, #EDE7D7, #17130F, #D8D0C0)
 */
export function CodeSightRisingHeading({
  text = 'TRAIN YOUR EYE FOR CODE.',
  subtext,
  className = ''
}: CodeSightRisingHeadingProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let dpr = window.devicePixelRatio || 1;
    let width = (canvas.width = container.clientWidth * dpr);
    let height = (canvas.height = container.clientHeight * dpr);

    const handleResize = () => {
      if (!canvas || !container) return;
      dpr = window.devicePixelRatio || 1;
      width = canvas.width = container.clientWidth * dpr;
      height = canvas.height = container.clientHeight * dpr;
    };
    window.addEventListener('resize', handleResize);

    // 12 Museum Plates Palette in CodeSight Warm Paper Tones
    const plates = [
      '#EDE7D7', '#17130F', '#D8D0C0', '#403A32', '#CFC3AA', '#746D61',
      '#F2EEE3', '#17130F', '#D9CFBA', '#F8F5EC', '#403A32', '#EDE7D7'
    ];

    // Simple procedural noise generator for matte texture
    const noiseLattice = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) noiseLattice[i] = Math.random();

    const getNoise = (x: number, y: number) => {
      const ix = Math.floor(x) & 31;
      const iy = Math.floor(y) & 31;
      return noiseLattice[iy * 32 + ix];
    };

    // Pre-generate tile textures for performance
    const tileCanvasList: HTMLCanvasElement[] = plates.map((color) => {
      const tileCanvas = document.createElement('canvas');
      tileCanvas.width = 160;
      tileCanvas.height = 120; // 4:3 aspect ratio
      const tCtx = tileCanvas.getContext('2d');
      if (tCtx) {
        tCtx.fillStyle = color;
        tCtx.fillRect(0, 0, 160, 120);

        // Add procedural noise shading
        const imgData = tCtx.getImageData(0, 0, 160, 120);
        const data = imgData.data;
        for (let py = 0; py < 120; py++) {
          for (let px = 0; px < 160; px++) {
            const idx = (py * 160 + px) * 4;
            const noiseVal = (getNoise(px * 0.1, py * 0.1) - 0.5) * 20;
            data[idx] = Math.min(255, Math.max(0, data[idx] + noiseVal));
            data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + noiseVal));
            data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + noiseVal));
          }
        }
        tCtx.putImageData(imgData, 0, 0);

        // Thin border
        tCtx.strokeStyle = 'rgba(216, 208, 192, 0.5)';
        tCtx.lineWidth = 1;
        tCtx.strokeRect(0, 0, 160, 120);
      }
      return tileCanvas;
    });

    // Ring Physics & Motion Constants
    const SPRING_K = 26;
    const SPRING_D = 5.7;
    const DUR = 12; // 12 second full orbit loop

    let rate = 0;
    let vel = 0;
    let tNow = 0;
    let lastTime = performance.now();
    let isHovered = false;

    const onMouseEnter = () => { isHovered = true; setHovering(true); };
    const onMouseLeave = () => { isHovered = false; setHovering(false); };

    container.addEventListener('mouseenter', onMouseEnter);
    container.addEventListener('mouseleave', onMouseLeave);

    const render = (now: number) => {
      const dt = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;

      // Spring physics calculation for ring momentum
      const targetHover = isHovered ? 1.0 : 0.05; // Slow ambient orbit when idle
      vel += ((targetHover - rate) * SPRING_K - vel * SPRING_D) * dt;
      rate += vel * dt;
      tNow = (tNow + dt * rate) % DUR;

      ctx.save();
      ctx.scale(dpr, dpr);
      const renderW = width / dpr;
      const renderH = height / dpr;

      ctx.clearRect(0, 0, renderW, renderH);

      const centerX = renderW / 2;
      const centerY = renderH / 2;
      const radiusX = Math.min(renderW, renderH) * 0.42;
      const radiusY = radiusX * 0.45;
      const tiltAngle = (25.5 * Math.PI) / 180; // rising-diagonal 25.5 deg axis

      // 1. Draw Ring Track Orbit (Back half)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(tiltAngle);

      ctx.beginPath();
      ctx.ellipse(0, 0, radiusX, radiusY, 0, Math.PI, Math.PI * 2);
      ctx.strokeStyle = 'rgba(216, 208, 192, 0.45)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      ctx.stroke();

      // 2. Draw 12 Museum Plates in 3D Orbital Projection
      const spinAngle = (tNow / DUR) * Math.PI * 2;
      const numPlates = 12;

      for (let i = 0; i < numPlates; i++) {
        const angle = spinAngle + (i * Math.PI * 2) / numPlates;
        const px = Math.cos(angle) * radiusX;
        const py = Math.sin(angle) * radiusY;

        // Depth scale based on Y position in ellipse
        const depth = (py + radiusY) / (radiusY * 2); // 0 to 1
        const scale = 0.45 + depth * 0.35;
        const alpha = 0.5 + depth * 0.5;

        ctx.save();
        ctx.translate(px, py);
        ctx.scale(scale, scale);
        ctx.globalAlpha = alpha;

        const tileImg = tileCanvasList[i % tileCanvasList.length];
        ctx.drawImage(tileImg, -40, -30, 80, 60);

        ctx.restore();
      }

      // Draw Ring Track Orbit (Front half)
      ctx.beginPath();
      ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI);
      ctx.strokeStyle = 'rgba(216, 208, 192, 0.75)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([6, 6]);
      ctx.stroke();

      ctx.restore();

      // 3. Draw Typography: Lightweight Sans Wide-Tracked Editorial "TRAIN YOUR EYE FOR CODE"
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#17130F';

      const fontSize = Math.max(22, Math.min(48, renderW * 0.045));
      ctx.font = `400 ${fontSize}px "Helvetica Neue", Helvetica, Inter, Arial, sans-serif`;

      const line1 = 'TRAIN YOUR EYE';
      const line2 = 'FOR CODE';
      const spacingY = fontSize * 1.25;

      // Draw line 1 with wide letter spacing
      ctx.fillText(line1, centerX, centerY - spacingY * 0.5);
      // Draw line 2
      ctx.fillText(line2, centerX, centerY + spacingY * 0.5);

      ctx.restore();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mouseenter', onMouseEnter);
      container.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative min-h-[280px] sm:min-h-[360px] flex flex-col items-center justify-center overflow-hidden rounded-[12px] border border-[#D8D0C0] bg-[#F5F1E7] p-6 sm:p-12 shadow-sm ${className}`}
    >
      {/* Background Orbital Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full pointer-events-auto" />

      {/* Accessible Heading for SEO & Screen Readers */}
      <h1 className="sr-only">TRAIN YOUR EYE FOR CODE.</h1>

      {/* Subtext description */}
      {subtext && (
        <div className="relative z-10 mt-[200px] sm:mt-[240px] text-center">
          <p className="max-w-xl font-mono text-xs text-[#403A32] sm:text-sm leading-relaxed mx-auto">
            {subtext}
          </p>
        </div>
      )}
    </div>
  );
}
