import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { getExercise } from '../data/exercises';

export const AnalyzingPage: React.FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const exercise = getExercise(exerciseId || 'unchecked-return-values');

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Parsing AST & selected line tokens...",
    "Comparing findings against reference vectors...",
    "Evaluating explanation precision...",
    "Synthesizing teaching feedback..."
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 500);
    const timer2 = setTimeout(() => setCurrentStep(2), 1000);
    const timer3 = setTimeout(() => setCurrentStep(3), 1500);
    const timer4 = setTimeout(() => {
      navigate(`/review/${exercise.id}/results`);
    }, 2100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [exercise.id, navigate]);

  return (
    <main className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center relative z-10 px-6 py-12">
      <div className="flex flex-col items-center justify-center text-center max-w-md w-full glass-panel rounded-2xl p-10 shadow-2xl border border-outline-variant/10 relative overflow-hidden animate-fade-in">
        {/* Subtle glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Pulse icon */}
        <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-6 animate-pulse-subtle">
          <Sparkles className="w-6 h-6" />
        </div>

        <h1 className="font-display text-2xl font-semibold text-on-surface mb-2">
          Analyzing your review…
        </h1>
        <p className="font-sans text-xs text-on-surface-variant mb-8">
          Evaluating line accuracy, root-cause depth, and pattern reasoning.
        </p>

        {/* Diagnostic sequence steps */}
        <div className="w-full flex flex-col gap-3 font-mono text-xs text-left">
          {steps.map((text, idx) => {
            const isDone = currentStep > idx;
            const isCurrent = currentStep === idx;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-300 ${
                  isDone
                    ? 'bg-surface-container-high/60 border-primary/20 text-on-surface'
                    : isCurrent
                    ? 'bg-primary/10 border-primary/40 text-primary'
                    : 'bg-transparent border-transparent text-on-surface-variant/40'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-outline-variant/30 shrink-0" />
                )}
                <span className="truncate">{text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};
