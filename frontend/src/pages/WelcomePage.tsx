import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { getWeakestExercise } = useApp();

  const recommendedExercise = getWeakestExercise();

  return (
    <main className="w-full flex items-center justify-center min-h-[calc(100vh-64px)] relative z-10 px-6 py-12">
      <div className="flex flex-col w-full justify-center items-center relative">
        {/* Ambient Center Glow */}
        <div className="absolute w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        {/* Hero Frosted Glass Container - Soft-Technical shape (rounded-xl) */}
        <div
          className="relative z-10 flex flex-col items-center justify-center text-center max-w-[820px] px-8 sm:px-14 py-16 sm:py-24 rounded-xl glass-panel glass-panel-highlight shadow-md animate-fade-in"
        >
          {/* Status Protocol Badge */}
          <span className="font-mono text-xs tracking-[0.25em] text-primary uppercase mb-6 opacity-90 font-medium">
            Optics Protocol
          </span>

          {/* Main Headline */}
          <h1 className="font-display text-4xl sm:text-6xl lg:text-[64px] lg:leading-[1.1] tracking-[-0.03em] font-semibold text-on-surface mb-6 text-balance">
            Learn to see what others miss.
          </h1>

          {/* Subheading */}
          <p className="font-sans text-base sm:text-lg text-on-surface-variant max-w-[480px] mb-10 opacity-90 leading-relaxed font-normal">
            Code review is a skill. Practice it with precision, clarity, and deep focus.
          </p>

          {/* Action CTAs - Soft technical rounding (rounded-lg) */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => navigate(`/review/${recommendedExercise.id}`)}
              className="w-full sm:w-auto px-8 py-3 bg-primary text-on-primary font-mono text-xs font-semibold tracking-wider rounded-lg hover:bg-primary-fixed transition-all duration-200 shadow-sm hover:-translate-y-0.5 group flex items-center justify-center gap-2.5 active:scale-98"
            >
              <span>Start Reviewing</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </button>

            <button
              onClick={() => navigate('/practice')}
              className="w-full sm:w-auto px-8 py-3 bg-surface-container-high/40 border border-outline-variant/30 text-on-surface font-mono text-xs font-semibold tracking-wider rounded-lg hover:bg-surface-container-highest/60 hover:border-outline-variant/50 transition-all duration-200 backdrop-blur-sm group flex items-center justify-center gap-2.5"
            >
              <Search className="w-4 h-4 opacity-70 group-hover:rotate-12 transition-transform duration-200" />
              <span>Explore Practice</span>
            </button>
          </div>
        </div>

        {/* Scroll discovery affordance */}
        <div
          onClick={() => navigate('/dashboard')}
          className="mt-12 flex flex-col items-center gap-1.5 opacity-50 hover:opacity-100 transition-opacity duration-200 cursor-pointer animate-pulse-subtle"
        >
          <span className="font-mono text-[11px] tracking-widest text-on-surface uppercase">
            Open Dashboard
          </span>
          <ChevronDown className="w-4 h-4 text-on-surface" />
        </div>
      </div>
    </main>
  );
};
