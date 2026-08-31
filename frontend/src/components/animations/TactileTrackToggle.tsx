import React from 'react';
import { motion } from 'framer-motion';
import { useTrack } from '../../contexts/TrackContext';
import { Code2, Zap } from 'lucide-react';

export function TactileTrackToggle() {
  const { track, setTrack } = useTrack();
  const isStudent = track === 'student';

  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#746D61]">
        ACTIVE LEARNING TRACK
      </div>

      {/* Skeuomorphic Warm Track */}
      <div
        className="relative flex h-14 w-80 items-center justify-between rounded-full border border-[#403A32] bg-[#EDE7D7] p-1.5 shadow-inner"
        role="radiogroup"
        aria-label="CodeSight Track Selection"
      >
        {/* Sliding Raised Paper Thumb */}
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="absolute top-1.5 bottom-1.5 w-[148px] rounded-full border border-[#403A32] bg-[#F8F5EC] shadow-md"
          style={{
            left: isStudent ? '6px' : 'calc(100% - 154px)'
          }}
        />

        {/* Student Track Option */}
        <button
          type="button"
          onClick={() => setTrack('student')}
          className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-full py-2 font-mono text-xs font-bold transition-colors ${
            isStudent ? 'text-[#17130F]' : 'text-[#746D61] hover:text-[#17130F]'
          }`}
          role="radio"
          aria-checked={isStudent}
        >
          <Code2 size={14} className={isStudent ? 'text-[#17130F]' : 'text-[#746D61]'} />
          <span>STUDENT</span>
        </button>

        {/* AI Engineer Track Option */}
        <button
          type="button"
          onClick={() => setTrack('engineer')}
          className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-full py-2 font-mono text-xs font-bold transition-colors ${
            !isStudent ? 'text-[#17130F]' : 'text-[#746D61] hover:text-[#17130F]'
          }`}
          role="radio"
          aria-checked={!isStudent}
        >
          <Zap size={14} className={!isStudent ? 'text-[#17130F]' : 'text-[#746D61]'} />
          <span>AI ENGINEER</span>
        </button>
      </div>

      <div className="mt-2.5 font-mono text-[11px] font-semibold text-[#17130F]">
        {isStudent ? 'STUDENT ◉──────── AI ENGINEER' : 'STUDENT ────────◉ AI ENGINEER'}
      </div>
    </div>
  );
}
