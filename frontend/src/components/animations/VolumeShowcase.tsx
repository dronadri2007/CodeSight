import React from 'react';
import { motion } from 'framer-motion';
import { useTrack, LevelType } from '../../contexts/TrackContext';
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

interface VolumeInfo {
  num: string;
  trackName: string;
  level: LevelType;
  title: string;
  subtitle: string;
  description: string;
  unlocked: boolean;
}

export function VolumeShowcase() {
  const { track, level, setLevel } = useTrack();

  const volumes: VolumeInfo[] = [
    {
      num: '01',
      trackName: 'STUDENT',
      level: 'beginner',
      title: 'STUDENT BEGINNER',
      subtitle: 'Fundamentals & Data Structures',
      description: 'Variables, conditions, loops, array manipulation, and linear search complexity.',
      unlocked: true,
    },
    {
      num: '02',
      trackName: 'STUDENT',
      level: 'intermediate',
      title: 'STUDENT INTERMEDIATE',
      subtitle: 'Algorithms & Big-O Optimization',
      description: 'Binary search, sorting, hashing, recursion, and O(N log N) space/time tradeoffs.',
      unlocked: true,
    },
    {
      num: '03',
      trackName: 'STUDENT',
      level: 'pro',
      title: 'STUDENT PRO',
      subtitle: 'Advanced Graphs & Dynamic Programming',
      description: 'Graph traversal, memoization, dynamic programming, and optimal space reduction.',
      unlocked: false,
    },
    {
      num: '04',
      trackName: 'AI ENGINEER',
      level: 'beginner',
      title: 'AI ENGINEER BEGINNER',
      subtitle: 'Common Syntax & Boundary Defects',
      description: 'Catch input validation flaws, simple off-by-one errors, and unhandled null pointer exceptions.',
      unlocked: true,
    },
    {
      num: '05',
      trackName: 'AI ENGINEER',
      level: 'intermediate',
      title: 'AI ENGINEER INTERMEDIATE',
      subtitle: 'Concurrency & Auth Vulnerabilities',
      description: 'Audit race conditions, authorization bypasses, SQL injections, and state corruption.',
      unlocked: true,
    },
    {
      num: '06',
      trackName: 'AI ENGINEER',
      level: 'pro',
      title: 'AI ENGINEER PRO',
      subtitle: 'System Performance & AI Hallucinations',
      description: 'Locate resource leaks, deadlock states, AI logic hallucinations, and multi-file architectural flaws.',
      unlocked: false,
    },
  ];

  return (
    <section className="my-10 mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
      {/* 6 Level Volume Showcase Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {volumes.map((vol) => {
          const isSelected = level === vol.level && track.toUpperCase() === vol.trackName;

          return (
            <motion.div
              key={vol.num}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              onClick={() => vol.unlocked && setLevel(vol.level)}
              className={`relative flex flex-col justify-between overflow-hidden rounded-[12px] border p-6 text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#17130F] bg-[#F5F1E7] shadow-md'
                  : vol.unlocked
                  ? 'border-[#D8D0C0] bg-[#F8F5EC] hover:border-[#17130F]'
                  : 'border-[#E5DFD1] bg-[#F2EEE3]/60 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#D8D0C0] pb-3">
                  <span className="font-mono text-3xl font-extrabold text-[#17130F]">
                    {vol.num}
                  </span>
                  {vol.unlocked ? (
                    <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-[#17130F]">
                      <CheckCircle2 size={12} /> UNLOCKED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-[#746D61]">
                      <Lock size={12} /> LOCKED
                    </span>
                  )}
                </div>

                <div className="mt-4 font-mono text-[10px] font-bold uppercase tracking-widest text-[#746D61]">
                  {vol.trackName}
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#17130F]">
                  {vol.title}
                </h3>
                <h4 className="mt-1 font-mono text-xs font-semibold text-[#403A32]">
                  {vol.subtitle}
                </h4>

                <p className="mt-3 text-xs leading-relaxed text-[#746D61]">
                  {vol.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-[#D8D0C0] pt-4">
                <span className="font-mono text-[10px] font-bold text-[#746D61]">
                  MODULE {vol.num}
                </span>

                {vol.unlocked ? (
                  <Link
                    href={vol.trackName === 'STUDENT' ? '/write' : '/code-review'}
                    className="flex items-center gap-1 font-mono text-xs font-bold text-[#17130F] hover:underline"
                  >
                    <span>ENTER</span>
                    <ArrowRight size={14} />
                  </Link>
                ) : (
                  <span className="font-mono text-[10px] text-[#746D61]">PASS EXAM TO UNLOCK</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
