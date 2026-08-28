import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight, ChevronRight, ShieldAlert, Lock, AlertTriangle, Layers, GitBranch, Cpu } from 'lucide-react';
import { EXERCISES, Exercise } from '../data/exercises';
import { DEFECT_CLASSES, getDefectClass } from '../data/defectClasses';

export const PracticePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState<string>('all');

  const featuredExercise = EXERCISES.find((ex) => ex.id === 'unchecked-return-values') || EXERCISES[0];
  const featuredClass = getDefectClass(featuredExercise.defectClassId);

  const filteredExercises = EXERCISES.filter((ex) => {
    if (selectedClass === 'all') return true;
    return ex.defectClassId === selectedClass;
  });

  const getClassIcon = (classId: string) => {
    switch (classId) {
      case 'injection': return <ShieldAlert className="w-4 h-4 text-error" />;
      case 'auth': return <Lock className="w-4 h-4 text-primary" />;
      case 'error-handling': return <AlertTriangle className="w-4 h-4 text-tertiary" />;
      case 'concurrency': return <Layers className="w-4 h-4 text-secondary" />;
      case 'logic-boundary': return <GitBranch className="w-4 h-4 text-primary" />;
      case 'resource-performance': return <Cpu className="w-4 h-4 text-secondary" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 py-10 flex flex-col gap-10 relative z-10 animate-fade-in">
      {/* Header Section */}
      <section className="flex flex-col gap-2 relative">
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-on-surface tracking-tight">
          Practice
        </h1>
        <p className="font-sans text-base sm:text-lg text-on-surface-variant max-w-2xl">
          Exercises selected for where you are right now.
        </p>
      </section>

      {/* Featured Practice Card */}
      <section className="w-full">
        <div
          onClick={() => navigate(`/review/${featuredExercise.id}`)}
          className="w-full glass-panel rounded-xl relative overflow-hidden shadow-sm flex flex-col md:flex-row group cursor-pointer hover:border-outline-variant/30 transition-all duration-200"
        >
          {/* Left Content */}
          <div className="p-7 md:w-2/3 flex flex-col justify-between relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-tertiary/15 text-tertiary border border-tertiary/20 uppercase tracking-wider">
                  Featured Weakness
                </span>
                <span className="font-mono text-xs text-on-surface-variant flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {featuredExercise.timeMinutes} min
                </span>
                <span className="font-mono text-xs text-on-surface-variant/60">
                  • {featuredExercise.language}
                </span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-on-surface mb-2">
                {featuredExercise.title}
              </h2>
              <p className="font-sans text-sm text-on-surface-variant max-w-xl mb-5 leading-relaxed">
                You've missed this pattern recently in your review sessions. Master the idiom of robust return status handling before moving on to concurrent data structures.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/review/${featuredExercise.id}`);
                }}
                className="bg-primary text-on-primary font-mono text-xs font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-fixed transition-colors flex items-center gap-2 shadow-sm"
              >
                <span>Start Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Visual Rep */}
          <div className="md:w-1/3 bg-surface-container-highest/20 p-7 flex flex-col justify-center items-center relative border-t md:border-t-0 md:border-l border-outline-variant/10">
            <div className="flex flex-col gap-2 w-full max-w-[220px] font-mono text-xs text-on-surface-variant/80">
              <div className="flex justify-between items-center py-1 border-b border-outline-variant/10">
                <span>Category</span>
                <span className="text-on-surface font-medium">{featuredClass.shortName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-outline-variant/10">
                <span>Difficulty</span>
                <span className="text-tertiary font-medium">{featuredExercise.difficulty}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>Inspection</span>
                <span className="text-primary font-medium">Single Vector</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter Tabs */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          <button
            onClick={() => setSelectedClass('all')}
            className={`px-3.5 py-1.5 rounded-lg font-mono text-xs whitespace-nowrap transition-all ${
              selectedClass === 'all'
                ? 'bg-primary text-on-primary font-semibold shadow-sm'
                : 'bg-surface-container-high/40 text-on-surface-variant hover:text-on-surface border border-outline-variant/15'
            }`}
          >
            All Modules ({EXERCISES.length})
          </button>
          {DEFECT_CLASSES.map((dc) => (
            <button
              key={dc.id}
              onClick={() => setSelectedClass(dc.id)}
              className={`px-3.5 py-1.5 rounded-lg font-mono text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedClass === dc.id
                  ? 'bg-primary text-on-primary font-semibold shadow-sm'
                  : 'bg-surface-container-high/40 text-on-surface-variant hover:text-on-surface border border-outline-variant/15'
              }`}
            >
              <span>{dc.shortName}</span>
            </button>
          ))}
        </div>

        {/* Exercises List */}
        <div className="flex flex-col gap-2.5">
          {filteredExercises.map((ex) => {
            const defClass = getDefectClass(ex.defectClassId);

            return (
              <div
                key={ex.id}
                onClick={() => navigate(`/review/${ex.id}`)}
                className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg glass-panel hover:border-outline-variant/30 hover:bg-surface-container-high/30 transition-all duration-200 cursor-pointer relative overflow-hidden"
              >
                <div className="flex items-start md:items-center gap-3.5">
                  <div className="w-9 h-9 rounded bg-surface-container-highest/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {getClassIcon(ex.defectClassId)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-sans text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                        {ex.title}
                      </h3>
                      {ex.isCleanCodeTrap && (
                        <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-secondary/15 text-secondary border border-secondary/20 font-semibold">
                          Discernment Trap
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-on-surface-variant font-mono">
                      <span>{ex.language}</span>
                      <span>•</span>
                      <span>{defClass.shortName}</span>
                      <span>•</span>
                      <span>{ex.difficulty}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 md:mt-0 flex items-center justify-between md:justify-end gap-5 shrink-0">
                  <span className="font-mono text-xs text-on-surface-variant flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {ex.timeMinutes} min
                  </span>
                  <div className="w-7 h-7 rounded bg-surface-container-highest flex items-center justify-center text-on-surface-variant group-hover:text-primary group-hover:translate-x-0.5 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
