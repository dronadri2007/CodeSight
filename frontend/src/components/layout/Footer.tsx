import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { RotateCcw } from 'lucide-react';

export const Footer: React.FC = () => {
  const { resetProgress } = useApp();

  return (
    <footer className="relative z-10 w-full bg-surface-container-lowest/30 backdrop-blur-md py-8 mt-24 border-t border-outline-variant/10">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-on-surface-variant">
        <div className="flex items-center gap-6">
          <Link to="/practice" className="hover:text-primary transition-colors">
            Practice
          </Link>
          <Link to="/progress" className="hover:text-primary transition-colors">
            Progress
          </Link>
          <Link to="/battle" className="hover:text-primary transition-colors">
            Battle
          </Link>
          <Link to="/ai-vs-you" className="hover:text-primary transition-colors">
            AI vs You
          </Link>
          <button
            onClick={() => {
              if (window.confirm("Reset all local review progress and scores to default?")) {
                resetProgress();
              }
            }}
            className="hover:text-tertiary transition-colors flex items-center gap-1 opacity-75 hover:opacity-100"
            title="Reset simulated data for fresh demo"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Demo
          </button>
        </div>
        <div className="tracking-widest uppercase opacity-60">
          © 2026 CODESIGHT.PRECISION
        </div>
      </div>
    </footer>
  );
};
