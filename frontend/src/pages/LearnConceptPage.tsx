import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, XCircle, HelpCircle } from 'lucide-react';
import { getConcept, Concept } from '../data/concepts';
import { getExercise } from '../data/exercises';
import { useApp } from '../context/AppContext';

export const LearnConceptPage: React.FC = () => {
  const { conceptId } = useParams<{ conceptId: string }>();
  const navigate = useNavigate();
  const { markConceptComplete } = useApp();

  const concept = getConcept(conceptId || 'error-handling-returns');
  const targetedExercise = getExercise(concept.targetedExerciseId);

  // Micro-Check interaction state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    setShowExplanation((prev) => ({ ...prev, [questionId]: true }));
  };

  const handleFinishLearning = () => {
    markConceptComplete(concept.id);
    navigate(`/review/${targetedExercise.id}`);
  };

  return (
    <main className="w-full max-w-[1280px] mx-auto px-6 md:px-12 py-10 flex flex-col gap-10 relative z-10 animate-fade-in">
      {/* Module Header */}
      <header className="flex flex-col gap-2 border-b border-outline-variant/10 pb-6">
        <span className="font-mono text-xs text-primary font-semibold uppercase tracking-widest">
          Module {concept.moduleNumber} · Concept Mastery
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-on-surface tracking-tight">
          {concept.title}
        </h1>
        <p className="font-sans text-sm sm:text-base text-on-surface-variant max-w-3xl leading-relaxed">
          {concept.summary}
        </p>
      </header>

      {/* Code Comparison (Before & After) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vulnerable Before */}
        <div className="glass-panel rounded-xl overflow-hidden shadow-sm flex flex-col border border-error/20">
          <div className="bg-surface-container-highest px-4 py-2.5 flex justify-between items-center border-b border-outline-variant/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-error" />
              <span className="font-mono text-xs font-semibold text-on-surface">Vulnerable Implementation</span>
            </div>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-error-container/20 text-error border border-error/30">
              Defect Vector
            </span>
          </div>

          <div className="p-4 bg-[#0F172A] flex-1 overflow-x-auto font-mono text-xs text-on-surface">
            <div className="text-tertiary text-[11px] mb-2">// {concept.beforeSnippet.annotation}</div>
            <pre className="text-red-200 leading-relaxed whitespace-pre-wrap">{concept.beforeSnippet.code}</pre>
          </div>
        </div>

        {/* Secured After */}
        <div className="glass-panel rounded-xl overflow-hidden shadow-sm flex flex-col border border-primary/20">
          <div className="bg-surface-container-highest px-4 py-2.5 flex justify-between items-center border-b border-outline-variant/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="font-mono text-xs font-semibold text-on-surface">Secured Implementation</span>
            </div>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-primary-container/20 text-primary border border-primary/30">
              Mitigated
            </span>
          </div>

          <div className="p-4 bg-[#0F172A] flex-1 overflow-x-auto font-mono text-xs text-on-surface">
            <div className="text-primary text-[11px] mb-2">// {concept.afterSnippet.annotation}</div>
            <pre className="text-emerald-200 leading-relaxed whitespace-pre-wrap">{concept.afterSnippet.code}</pre>
          </div>
        </div>
      </section>

      {/* Mental Model & System Flow Representation */}
      <section className="glass-panel rounded-xl p-6 relative overflow-hidden shadow-sm">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="lg:w-1/3 flex flex-col gap-2">
            <span className="font-mono text-xs text-on-surface-variant uppercase tracking-widest font-semibold">
              Pattern to Remember
            </span>
            <h3 className="font-display text-xl font-semibold text-on-surface">
              {concept.mentalModel.name}
            </h3>
            <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              {concept.mentalModel.description}
            </p>
          </div>

          {/* System Flow Diagram */}
          <div className="lg:w-2/3 w-full bg-surface-container-highest/30 rounded-lg p-4 border border-outline-variant/10 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs text-center">
            {/* Step 1 */}
            <div className="flex-1 w-full bg-surface-dim p-3 rounded border border-outline-variant/15 flex flex-col gap-0.5">
              <span className="text-on-surface-variant text-[10px] uppercase tracking-wider">{concept.mentalModel.sourceLabel}</span>
              <span className="font-semibold text-on-surface text-xs">{concept.mentalModel.sourceExample}</span>
            </div>

            <div className="text-primary font-bold hidden sm:block">→</div>

            {/* Step 2 */}
            <div className="flex-1 w-full bg-primary/10 border border-primary/30 p-3 rounded flex flex-col gap-0.5">
              <span className="text-primary text-[10px] uppercase tracking-wider font-semibold">{concept.mentalModel.flowLabel}</span>
              <span className="text-primary font-semibold text-xs">{concept.mentalModel.flowState}</span>
            </div>

            <div className="text-primary font-bold hidden sm:block">→</div>

            {/* Step 3 */}
            <div className="flex-1 w-full bg-surface-dim p-3 rounded border border-outline-variant/15 flex flex-col gap-0.5">
              <span className="text-on-surface-variant text-[10px] uppercase tracking-wider">{concept.mentalModel.sinkLabel}</span>
              <span className="font-semibold text-on-surface text-xs">{concept.mentalModel.sinkExample}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Micro-Check Section (2 Interactive Questions) */}
      <section className="flex flex-col gap-4 pt-2 border-t border-outline-variant/10">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-primary" />
          <h2 className="font-display text-xl font-semibold text-on-surface">
            Micro-Check: Test Your Understanding
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {concept.microChecks.map((mc, idx) => {
            const chosenOptId = selectedAnswers[mc.id];
            const isAnswered = !!chosenOptId;
            const chosenOption = mc.options.find((o) => o.id === chosenOptId);

            return (
              <div key={mc.id} className="glass-panel rounded-lg p-5 flex flex-col justify-between gap-3.5">
                <div>
                  <span className="font-mono text-[11px] text-primary uppercase tracking-wider font-semibold block mb-1.5">
                    Check 0{idx + 1}
                  </span>
                  <h4 className="font-sans text-xs sm:text-sm font-semibold text-on-surface mb-3">
                    {mc.question}
                  </h4>

                  <div className="flex flex-col gap-2.5">
                    {mc.options.map((opt) => {
                      const isSelected = chosenOptId === opt.id;
                      let btnStyle = "bg-surface-dim hover:bg-surface-container-high border-outline-variant/15 text-on-surface";
                      if (isSelected) {
                        btnStyle = opt.isCorrect
                          ? "bg-primary/15 border-primary text-primary"
                          : "bg-error/15 border-error text-error";
                      }

                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectOption(mc.id, opt.id)}
                          className={`p-3 rounded border text-left transition-all text-xs font-sans flex flex-col gap-1 ${btnStyle}`}
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <span>{opt.label}</span>
                            {isSelected && (
                              opt.isCorrect ? <Check className="w-3.5 h-3.5 text-primary" /> : <XCircle className="w-3.5 h-3.5 text-error" />
                            )}
                          </div>
                          {opt.codeSnippet && (
                            <pre className="font-mono text-[11px] p-2 bg-[#0F172A] rounded text-on-surface overflow-x-auto mt-0.5">
                              {opt.codeSnippet}
                            </pre>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {isAnswered && chosenOption && (
                  <div className={`p-2.5 rounded text-xs leading-relaxed mt-1 animate-fade-in border ${
                    chosenOption.isCorrect ? 'bg-primary/10 border-primary/20 text-on-surface' : 'bg-error/10 border-error/20 text-on-surface'
                  }`}>
                    <strong>{chosenOption.isCorrect ? "Correct!" : "Not quite."}</strong> {chosenOption.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Completion & Next Targeted Practice Action */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl bg-gradient-to-r from-primary/10 via-surface-container to-surface-container-high border border-primary/20">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-xs text-primary font-semibold uppercase tracking-wider">
            Targeted Practice Ready
          </span>
          <h3 className="font-display text-lg font-semibold text-on-surface">
            Apply this concept to: {targetedExercise.title}
          </h3>
        </div>

        <button
          onClick={handleFinishLearning}
          className="w-full sm:w-auto px-7 py-3 bg-primary text-on-primary hover:bg-primary-fixed hover:-translate-y-0.5 font-mono text-xs font-semibold tracking-wider rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
        >
          <span>Start Similar Exercise</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </main>
  );
};
