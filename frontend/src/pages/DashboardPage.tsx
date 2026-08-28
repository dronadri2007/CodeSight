import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Radar, AlertTriangle, ShieldCheck, Lock, Layers, GitBranch, Cpu } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEFECT_CLASSES, getDefectClass } from '../data/defectClasses';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, getWeakestExercise } = useApp();

  const weaknessClass = getDefectClass(userProfile.actionableWeaknessId);
  const nextExercise = getWeakestExercise();

  const getDefectIcon = (id: string) => {
    switch (id) {
      case 'injection': return <ShieldCheck className="w-4 h-4 text-error" />;
      case 'auth': return <Lock className="w-4 h-4 text-primary" />;
      case 'error-handling': return <AlertTriangle className="w-4 h-4 text-tertiary" />;
      case 'concurrency': return <Layers className="w-4 h-4 text-secondary" />;
      case 'logic-boundary': return <GitBranch className="w-4 h-4 text-primary" />;
      case 'resource-performance': return <Cpu className="w-4 h-4 text-secondary" />;
      default: return <ShieldCheck className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 py-10 flex flex-col gap-10 relative z-10 animate-fade-in">
      {/* Header & Overall Stats Split */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-2 border-b border-outline-variant/10 pb-8">
        <div className="flex flex-col gap-1">
          <p className="font-sans text-xl text-on-surface-variant/80 tracking-tight">
            Good afternoon,
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-on-surface tracking-tight font-semibold">
            {userProfile.name}.
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider opacity-70">
              REVIEW SKILL
            </span>
            <div className="flex flex-col items-start">
              <span className="font-display text-4xl sm:text-5xl text-primary font-semibold tracking-tighter">
                {userProfile.overallSkill}%
              </span>
            </div>
          </div>
          <div className="h-10 w-px bg-outline-variant/20 hidden sm:block" />
          <div className="hidden sm:flex flex-col text-xs font-mono text-on-surface-variant">
            <span>{userProfile.reviewsCompleted} REVIEWS</span>
            <span className="text-primary font-semibold">{userProfile.streakDays} DAY STREAK</span>
          </div>
        </div>
      </section>

      {/* 12-Column Grid: Weakness + Up Next */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Actionable Weakness Panel */}
        <div className="lg:col-span-8 glass-panel rounded-xl p-7 flex flex-col justify-between min-h-[290px] shadow-sm relative overflow-hidden group">
          <div className="relative z-10 flex flex-col gap-2">
            <span className="font-mono text-xs text-tertiary-fixed-dim font-medium uppercase tracking-wider flex items-center gap-1.5">
              <Radar className="w-4 h-4 text-tertiary" />
              Actionable Weakness
            </span>
            <h2 className="font-display text-2xl sm:text-3xl text-on-surface mt-1 font-semibold">
              {weaknessClass.name}
            </h2>
          </div>

          <div className="relative z-10 bg-surface/50 backdrop-blur-md rounded-lg p-4 border border-outline-variant/10 max-w-xl my-4">
            <p className="font-sans text-sm sm:text-base text-on-surface-variant leading-relaxed">
              {userProfile.weaknessDetail}
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4">
            <button
              onClick={() => navigate(`/learn/${nextExercise.conceptId}`)}
              className="font-mono text-xs font-semibold text-tertiary hover:text-tertiary-fixed transition-colors flex items-center gap-1.5"
            >
              <span>Review Concept Walkthrough</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Up Next Recommended Exercise Card */}
        <div
          onClick={() => navigate(`/review/${nextExercise.id}`)}
          className="lg:col-span-4 bg-primary text-on-primary rounded-xl p-7 flex flex-col justify-between min-h-[290px] shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group cursor-pointer"
        >
          <div className="relative z-10 flex justify-between items-center">
            <span className="font-mono text-xs text-on-primary/80 uppercase tracking-wider font-semibold">
              Up Next
            </span>
            <span className="font-mono text-xs bg-black/20 text-on-primary px-2.5 py-0.5 rounded">
              {nextExercise.timeMinutes} min
            </span>
          </div>

          <div className="relative z-10 flex flex-col gap-2 my-4">
            <h3 className="font-display text-2xl font-semibold text-white">
              {nextExercise.title}
            </h3>
            <p className="text-xs text-on-primary/80 line-clamp-2 leading-relaxed">
              {nextExercise.description}
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between w-full pt-2 border-t border-white/15">
            <span className="font-mono text-xs text-white/90 font-medium">
              Start Practice
            </span>
            <div className="w-7 h-7 rounded bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* Six Defect Classes Grid */}
      <section className="flex flex-col gap-4 mt-2">
        <div className="flex justify-between items-center">
          <h3 className="font-display text-lg font-medium text-on-surface-variant/70">
            Defect Classes Mastery
          </h3>
          <Link
            to="/progress"
            className="font-mono text-xs text-primary hover:underline flex items-center gap-1"
          >
            Detailed Analytics →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEFECT_CLASSES.map((dc) => {
            const score = userProfile.defectClassScores[dc.id] ?? 50;
            const isWeakest = dc.id === userProfile.actionableWeaknessId;

            return (
              <div
                key={dc.id}
                onClick={() => navigate(`/practice`)}
                className={`glass-panel rounded-lg p-4 flex flex-col gap-3 hover:border-outline-variant/30 transition-all duration-200 cursor-pointer relative overflow-hidden ${
                  isWeakest ? 'border-l-4 border-l-tertiary bg-tertiary/5' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="opacity-80">{getDefectIcon(dc.id)}</span>
                    <span className="font-sans text-sm font-medium text-on-surface">
                      {dc.shortName}
                    </span>
                  </div>
                  <span
                    className={`font-mono text-xs font-semibold ${
                      isWeakest ? 'text-tertiary' : 'text-primary'
                    }`}
                  >
                    {score}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 bg-surface-container-highest/60 rounded overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isWeakest ? 'bg-tertiary' : 'bg-primary'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
