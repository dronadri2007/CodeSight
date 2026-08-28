import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, RotateCcw, CheckCircle2, XCircle, AlertTriangle, Bug, Brain, Compass } from 'lucide-react';
import { getExercise } from '../data/exercises';
import { getDefectClass } from '../data/defectClasses';
import { useApp } from '../context/AppContext';

export const ReviewResultsPage: React.FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const { lastReviewResult } = useApp();

  const exercise = getExercise(exerciseId || 'unchecked-return-values');
  const defectClass = getDefectClass(exercise.defectClassId);

  // Fallback to model solution if no prior submission in memory
  const result = lastReviewResult && lastReviewResult.exerciseId === exercise.id
    ? lastReviewResult
    : {
        score: 72,
        confirmedFindings: 1,
        missedDefects: 0,
        falsePositives: 0,
        hintsUsed: 1,
        selectedLines: exercise.vulnerableLines,
        userExplanation: "Direct state change without verifying external API response payload status.",
        whereSnippet: exercise.modelSolution.whereSnippet,
        whereLine: exercise.modelSolution.whereLine,
        whyYouMissedIt: exercise.modelSolution.whyYouMissedIt,
        patternToWatch: exercise.modelSolution.patternToWatch,
        tags: exercise.modelSolution.tags,
        beforeSnippet: exercise.modelSolution.beforeSnippet,
        afterSnippet: exercise.modelSolution.afterSnippet,
        isCleanCodeTrap: exercise.isCleanCodeTrap
      };

  return (
    <main className="w-full max-w-[960px] mx-auto px-6 py-10 flex flex-col gap-8 relative z-10 animate-fade-in">
      {/* Header & Score Summary */}
      <section className="flex flex-col items-center text-center gap-3 relative">
        <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-1 shadow-sm">
          <CheckCircle2 className="w-6 h-6" />
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-on-surface tracking-tight">
          Review Complete
        </h1>
        <p className="font-sans text-sm text-on-surface-variant max-w-lg">
          Code analysis finished. Here is the breakdown of your findings, reasoning gap, and pattern model.
        </p>

        {/* Score & Metrics Chip */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-2 bg-surface-container-high/50 backdrop-blur-md rounded-xl px-7 py-3 border border-outline-variant/15 shadow-sm">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-on-surface-variant">
              Score
            </span>
            <span className="font-display text-2xl font-bold text-primary">
              {result.score}
            </span>
            <span className="font-mono text-xs text-on-surface-variant">/ 100</span>
          </div>

          <div className="h-5 w-px bg-outline-variant/20 hidden sm:block" />

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-primary flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {result.confirmedFindings} Caught
            </span>
            <span className="text-tertiary flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              {result.missedDefects} Missed
            </span>
            {result.falsePositives > 0 && (
              <span className="text-error flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {result.falsePositives} False Alarm
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Teaching Core: WHERE, WHY, PATTERN */}
      <section className="flex flex-col gap-5">
        {/* WHERE & PATTERN Panel */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* WHERE */}
          <div className="md:col-span-5 glass-panel rounded-xl p-5 flex flex-col gap-3.5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-on-surface-variant">
              <Bug className="w-4 h-4 text-primary" />
              <span>Where</span>
            </div>

            <div className="bg-surface-dim p-3 rounded font-mono text-xs text-on-surface overflow-x-auto border border-outline-variant/10">
              <span className="text-outline-variant select-none">Line {result.whereLine} | </span>
              <span className="text-primary font-semibold">{result.whereSnippet}</span>
            </div>

            <div className="pt-1 flex flex-col gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-tertiary" />
                Pattern to Watch
              </span>
              <p className="font-sans text-xs text-on-surface leading-relaxed">
                {result.patternToWatch}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                {result.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant border border-outline-variant/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* WHY YOU MISSED IT */}
          <div className="md:col-span-7 glass-panel rounded-xl p-5 flex flex-col gap-3.5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-primary font-semibold">
              <Brain className="w-4 h-4" />
              <span>Why you missed it</span>
            </div>

            <div className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed flex flex-col gap-2.5">
              <p>{result.whyYouMissedIt}</p>
              
              {/* Code comparison box */}
              <div className="mt-1 bg-[#0F172A] p-3 rounded font-mono text-xs text-on-surface border border-outline-variant/15 flex flex-col gap-2.5">
                <div>
                  <span className="text-tertiary text-[11px] block mb-1"># Problematic Implementation:</span>
                  <pre className="text-red-300 whitespace-pre-wrap">{result.beforeSnippet}</pre>
                </div>
                <div className="border-t border-white/10 pt-2">
                  <span className="text-primary text-[11px] block mb-1"># Recommended Guard:</span>
                  <pre className="text-emerald-300 whitespace-pre-wrap">{result.afterSnippet}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-outline-variant/10">
        <button
          onClick={() => navigate(`/review/${exercise.id}`)}
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/40 font-mono text-xs font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>

        <button
          onClick={() => navigate(`/learn/${exercise.conceptId}`)}
          className="w-full sm:w-auto px-7 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed hover:-translate-y-0.5 font-mono text-xs font-semibold tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <span>Learn the Concept</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </main>
  );
};
