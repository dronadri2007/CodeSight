import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight } from 'lucide-react';

export interface BestsellersBookShowcaseProps {
  headingFont?: string;
  bodyFont?: string;
  headingWeight?: string;
  bodyWeight?: string;
  primaryColor?: string;
  headingSize?: number;
  bodySize?: number;
  headingLetterSpacing?: number;
  className?: string;
  onSelectBook?: (bookId: string) => void;
}

interface BookConfig {
  id: string;
  dataBook: 'codex' | 'claude' | 'cursor';
  number: string;
  kicker: string;
  title: string;
  subtitle: string;
  description: string;
  footer: string;
  coverBg: string;
  coverInk: string;
  accentColor: string;
  route: string;
  levelBadge: string;
}

export function BestsellersBookShowcase({
  headingFont = 'iowan-old-style',
  bodyFont = 'iowan-old-style',
  headingWeight = '500',
  bodyWeight = '400',
  primaryColor = '#c3a47b',
  headingSize = 325,
  bodySize = 17,
  headingLetterSpacing = -0.085,
  className = '',
  onSelectBook,
}: BestsellersBookShowcaseProps) {
  const [, setLocation] = useLocation();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [activeBookId, setActiveBookId] = useState<string>('codex');
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const books: BookConfig[] = [
    {
      id: 'codex',
      dataBook: 'codex',
      number: 'VOLUME 01',
      kicker: 'CODESIGHT MANUAL 01',
      title: 'BEGINNER',
      subtitle: 'Level 1 · Algorithmic Instincts',
      description: 'Beginner entry-level CodeSight experience. Solve fundamental algorithmic problems and grade time & space complexity against optimal O(N) limits.',
      footer: '01 · BEGINNER LEVEL TRACK',
      coverBg: 'linear-gradient(135deg, #f0e6d2 0%, #dfd2b5 100%)',
      coverInk: '#31291e',
      accentColor: '#c3a47b',
      route: '/student/beginner',
      levelBadge: 'LEVEL 01',
    },
    {
      id: 'claude',
      dataBook: 'claude',
      number: 'VOLUME 02',
      kicker: 'CODESIGHT MANUAL 02',
      title: 'EXPERT',
      subtitle: 'Level 2 · System & Review Battles',
      description: 'Expert advanced coding & code review experience. Master complex system patterns, inspect bugs, and solve architectural review challenges.',
      footer: '02 · EXPERT LEVEL TRACK',
      coverBg: 'linear-gradient(135deg, #e9dac0 0%, #d8c4a0 100%)',
      coverInk: '#4b281a',
      accentColor: '#a96346',
      route: '/student/intermediate',
      levelBadge: 'LEVEL 02',
    },
    {
      id: 'cursor',
      dataBook: 'cursor',
      number: 'VOLUME 03',
      kicker: 'CODESIGHT MANUAL 03',
      title: 'PRO',
      subtitle: 'Level 3 · AI Code Repair',
      description: 'AI-assisted pro code repair and auditing. Locate hidden defects, repair broken AI code, and verify system safety under real production constraints.',
      footer: '03 · PRO LEVEL TRACK',
      coverBg: 'linear-gradient(135deg, #e2d9be 0%, #cfc09f 100%)',
      coverInk: '#293024',
      accentColor: '#89946f',
      route: '/student/pro',
      levelBadge: 'LEVEL 03',
    },
  ];

  // Mouse tilt parallax tracking effect
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = stage.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 40; // -20 to 20
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 40; // -20 to 20
      setMousePos({ x, y });
    };

    stage.addEventListener('mousemove', handleMouseMove);
    return () => stage.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleBookClick = (book: BookConfig) => {
    setActiveBookId(book.id);
    if (onSelectBook) {
      onSelectBook(book.id);
    } else {
      setLocation(book.route);
    }
  };

  return (
    <div
      ref={stageRef}
      className={`relative min-h-[620px] w-full overflow-hidden rounded-2xl border border-[#3d3123] bg-[#29251d] text-[#eee2ca] shadow-2xl ${className}`}
      style={
        {
          '--mx': `${mousePos.x}px`,
          '--my': `${mousePos.y}px`,
          background: 'linear-gradient(180deg, #343025 0%, #29251d 48%, #211e18 100%)',
          fontFamily: '"Iowan Old Style", "Palatino Linotype", Georgia, serif',
        } as React.CSSProperties
      }
    >
      {/* Background Radial Atmosphere Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_85%,rgba(195,164,123,0.22),transparent_55%)] pointer-events-none" />

      {/* Header Banner */}
      <div className="relative z-10 pt-8 pb-4 text-center">
        <h2
          className="mt-1 font-serif font-extrabold italic text-[#eee2ca]"
          style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            letterSpacing: '-0.035em',
            color: primaryColor,
          }}
        >
          3D Interactive Level Selection Showcase
        </h2>
        <p className="mt-2 text-xs text-[#c5b79e] max-w-lg mx-auto font-serif">
          Hover and select a field volume to inspect its progression gate and enter its dedicated workspace.
        </p>
      </div>

      {/* 3D Perspective Stage Container */}
      <div
        className="relative z-20 my-8 flex min-h-[440px] w-full items-center justify-center"
        style={{ perspective: '1400px', transformStyle: 'flat' }}
      >
        <div className="grid w-full max-w-6xl items-center justify-center gap-8 px-4 md:grid-cols-3">
          {books.map((book) => {
            const isSelected = activeBookId === book.id;

            return (
              <div
                key={book.id}
                onClick={() => handleBookClick(book)}
                onMouseEnter={() => setActiveBookId(book.id)}
                className="group relative cursor-pointer mx-auto w-full max-w-[320px] transition-all duration-500"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isSelected
                    ? 'translateY(-20px) scale(1.05) rotateX(-2deg)'
                    : 'translateY(0px) scale(0.97)',
                }}
              >
                {/* 3D Book Shadow */}
                <div
                  className="absolute inset-x-2 -bottom-5 h-8 rounded-full bg-black/70 blur-xl transition-all duration-500"
                  style={{ opacity: isSelected ? 0.9 : 0.45 }}
                />

                {/* 3D Book Structure Assembly */}
                <div
                  className="relative aspect-[0.672/1] w-full rounded-[4px] p-6 shadow-2xl transition-all duration-500"
                  style={{
                    background: book.coverBg,
                    boxShadow: isSelected
                      ? '0 32px 64px -12px rgba(0,0,0,0.6), inset -10px 0 18px rgba(0,0,0,0.15), inset 4px 0 9px rgba(255,255,255,0.2)'
                      : '0 18px 36px -10px rgba(0,0,0,0.38), inset -8px 0 14px rgba(0,0,0,0.12)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Left Spine Shadow Texture */}
                  <div className="absolute top-0 bottom-0 left-0 w-[6%] bg-gradient-to-r from-black/30 via-black/10 to-transparent pointer-events-none rounded-l-[4px]" />

                  {/* Level Badge Header */}
                  <div className="flex items-center justify-between border-b border-[#31291e]/20 pb-3 font-mono text-[10px] font-bold tracking-widest text-[#31291e]">
                    <span>{book.number}</span>
                    <span className="rounded bg-[#31291e] px-2 py-0.5 text-[#eee2ca]">
                      {book.levelBadge}
                    </span>
                  </div>

                  {/* Cover Copy Typography */}
                  <div className="my-6 text-center" style={{ color: book.coverInk }}>
                    <div className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] opacity-80">
                      {book.kicker}
                    </div>
                    <h3 className="mt-2 font-serif text-2xl sm:text-3xl font-extrabold leading-none tracking-tight">
                      {book.title}
                    </h3>
                    <div className="mt-2 font-serif text-xs font-semibold italic opacity-90">
                      "{book.subtitle}"
                    </div>
                  </div>

                  {/* Description */}
                  <p
                    className="text-[11px] leading-relaxed font-serif text-center mb-6 opacity-90"
                    style={{ color: book.coverInk }}
                  >
                    {book.description}
                  </p>

                  {/* Cover Footer & Action CTA */}
                  <div className="absolute bottom-4 left-6 right-6 border-t border-[#31291e]/20 pt-3 text-center">
                    <div className="font-mono text-[9px] font-bold uppercase tracking-widest text-[#31291e] mb-2">
                      {book.footer}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookClick(book);
                      }}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#31291e] bg-[#31291e] px-4 py-2 font-mono text-[11px] font-bold text-[#eee2ca] shadow-md transition-all hover:bg-[#1d1a15]"
                    >
                      <span>ENTER TRACK</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Notes */}
      <div className="relative z-10 pb-6 text-center font-mono text-[10px] text-[#c5b79e]">
        <span>CODESIGHT FIELD MANUAL SHOWCASE · INTEGRATED FROM THREEUI SOURCE</span>
      </div>
    </div>
  );
}
