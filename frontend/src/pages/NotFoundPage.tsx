import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <main className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center relative z-10 px-6 py-12">
      <div className="glass-panel rounded-2xl p-10 max-w-md w-full text-center flex flex-col items-center gap-4 shadow-xl border border-outline-variant/10 animate-fade-in">
        <div className="w-14 h-14 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
          <Compass className="w-6 h-6" />
        </div>

        <h1 className="font-display text-3xl font-semibold text-on-surface">
          404 · Route Not Found
        </h1>
        <p className="font-sans text-xs text-on-surface-variant max-w-xs leading-relaxed">
          The requested practice destination or review exercise is not available in the current curriculum.
        </p>

        <Link
          to="/dashboard"
          className="mt-4 px-6 py-2.5 bg-primary text-on-primary font-mono text-xs font-semibold rounded-full hover:bg-primary-fixed transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </main>
  );
};
