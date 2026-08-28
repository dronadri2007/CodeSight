import React from 'react';
import { Bot, User, CheckCircle2, EyeOff, Star, Sparkles } from 'lucide-react';

export const AiVsYouPage: React.FC = () => {
  return (
    <main className="w-full max-w-[1400px] mx-auto px-6 md:px-12 py-10 flex flex-col gap-10 relative z-10 animate-fade-in">
      {/* Header */}
      <section className="flex flex-col gap-2 border-b border-outline-variant/10 pb-6">
        <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-widest font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>Synthesis Benchmark</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-on-surface tracking-tight">
          AI vs You: Code Review Comparison
        </h1>
        <p className="font-sans text-sm sm:text-base text-on-surface-variant max-w-2xl">
          Side-by-side evaluation of automated static analysis vs human semantic code review. Discover where human intuition catches critical architectural gaps.
        </p>
      </section>

      {/* Side-by-Side Comparison Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
        {/* Left Column: YOU (Human Insight) */}
        <div className="flex flex-col gap-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/10">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs">
                <User className="w-3.5 h-3.5" />
              </div>
              <h2 className="font-display text-lg font-semibold text-on-surface">You (Human Reviewer)</h2>
            </div>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold">
              Deep Context
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {/* Finding 1 */}
            <div className="glass-panel rounded-lg p-4 border border-outline-variant/10 flex flex-col gap-1.5 shadow-sm">
              <div className="flex items-center gap-2 text-primary font-mono text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Line 42: Resource Leak</span>
              </div>
              <h3 className="font-sans text-sm font-semibold text-on-surface">
                Unclosed Database Connection
              </h3>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Spotted an unclosed database cursor handle inside the retry block of `fetchUserData`.
              </p>
              <div className="font-mono text-[11px] bg-surface-dim p-2 rounded text-secondary border border-outline-variant/10 mt-0.5">
                Line 42: cursor.close() omitted in retry loop
              </div>
            </div>

            {/* Finding 2 (CRITICAL CATCH) */}
            <div className="glass-panel rounded-lg p-4 border border-primary/40 bg-primary/10 shadow-sm flex flex-col gap-1.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-on-primary font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-bl shadow-sm flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" /> Critical Catch
              </div>

              <div className="flex items-center gap-2 text-primary font-mono text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <span>Line 118: Async Concurrency Race</span>
              </div>
              <h3 className="font-sans text-sm font-semibold text-on-surface">
                Cache Stampede / Thundering Herd
              </h3>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Identified that concurrent requests on cold cache bypass locks and overwhelm upstream databases. <strong className="text-primary font-semibold">AI Missed This entirely.</strong>
              </p>
              <div className="font-mono text-[11px] bg-surface-dim p-2 rounded text-primary border border-primary/20 mt-0.5">
                Line 118: await fetchFromExternalApi(reportId)
              </div>
            </div>

            {/* Finding 3 */}
            <div className="glass-panel rounded-lg p-4 border border-outline-variant/10 flex flex-col gap-1.5 shadow-sm">
              <div className="flex items-center gap-2 text-primary font-mono text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Line 255: Accessibility Gap</span>
              </div>
              <h3 className="font-sans text-sm font-semibold text-on-surface">
                Keyboard Navigation Trap
              </h3>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Noticed the error modal close button wasn't focusable via standard tab key sequences.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: AI REVIEWER */}
        <div className="flex flex-col gap-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/10">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-secondary/20 text-secondary border border-secondary/30 flex items-center justify-center font-bold text-xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <h2 className="font-display text-lg font-semibold text-on-surface">AI Reviewer</h2>
            </div>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 font-semibold">
              Automated Linter
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {/* AI Finding 1 */}
            <div className="glass-panel rounded-lg p-4 border border-outline-variant/10 flex flex-col gap-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-on-surface-variant font-semibold">
                  Line 42: Resource Leak
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant">
                  Agreement
                </span>
              </div>
              <h3 className="font-sans text-sm font-semibold text-on-surface">
                Flagged Missing db.close()
              </h3>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Static AST analysis flagged unclosed connection handler on line 42.
              </p>
            </div>

            {/* AI Finding 2 (MISSED) */}
            <div className="glass-panel rounded-lg p-4 border border-error/20 bg-error/5 flex flex-col gap-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-error font-mono text-xs font-semibold">
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Line 118: Concurrency Race</span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-error-container/20 text-error border border-error/30 font-semibold">
                  Missed
                </span>
              </div>
              <h3 className="font-sans text-sm font-semibold text-on-surface-variant line-through opacity-80">
                No concurrency issue detected
              </h3>
              <p className="font-sans text-xs text-on-surface-variant/80 italic leading-relaxed">
                Lacks cross-request temporal context to detect cache stampedes without state machine simulation.
              </p>
            </div>

            {/* AI Finding 3 */}
            <div className="glass-panel rounded-lg p-4 border border-outline-variant/10 flex flex-col gap-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-tertiary font-semibold">
                  Line 88: Strict Typing
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-tertiary/10 text-tertiary">
                  AI Suggestion
                </span>
              </div>
              <h3 className="font-sans text-sm font-semibold text-on-surface">
                Suggests interface UserData
              </h3>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Suggested replacing `any` with explicit TypeScript interface definition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Synthesis Matrix Table */}
      <section className="flex flex-col gap-3 pt-2 border-t border-outline-variant/10">
        <h3 className="font-display text-xl font-semibold text-on-surface">
          Line-by-Line Synthesis Matrix
        </h3>

        <div className="w-full glass-panel rounded-lg overflow-x-auto shadow-sm">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-surface-container-highest/50 font-mono text-[11px] text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/10">
                <th className="py-2.5 px-4 w-20">Line</th>
                <th className="py-2.5 px-4">Context</th>
                <th className="py-2.5 px-4">Your Finding</th>
                <th className="py-2.5 px-4">AI Finding</th>
                <th className="py-2.5 px-4 text-right">Verdict</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-outline-variant/5 hover:bg-surface-container-high/30 transition-colors">
                <td className="py-3 px-4 font-mono text-on-surface-variant">42</td>
                <td className="py-3 px-4 font-semibold text-on-surface">Database Handle</td>
                <td className="py-3 px-4 text-on-surface">Missing close in retry</td>
                <td className="py-3 px-4 text-on-surface">Missing close in retry</td>
                <td className="py-3 px-4 text-right">
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-secondary/10 text-secondary border border-secondary/20">
                    Agreement
                  </span>
                </td>
              </tr>
              <tr className="border-b border-outline-variant/5 bg-primary/10 font-semibold">
                <td className="py-3 px-4 font-mono text-primary">118</td>
                <td className="py-3 px-4 text-on-surface">Cache Synchronization</td>
                <td className="py-3 px-4 text-primary">Thundering herd race detected</td>
                <td className="py-3 px-4 text-on-surface-variant/60 italic">No defect detected</td>
                <td className="py-3 px-4 text-right">
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-primary text-on-primary shadow-sm font-bold">
                    YOU WIN
                  </span>
                </td>
              </tr>
              <tr className="border-b border-outline-variant/5 hover:bg-surface-container-high/30 transition-colors">
                <td className="py-3 px-4 font-mono text-on-surface-variant">255</td>
                <td className="py-3 px-4 font-semibold text-on-surface">Modal Accessibility</td>
                <td className="py-3 px-4 text-on-surface">tabindex missing on close</td>
                <td className="py-3 px-4 text-on-surface-variant/60 italic">Skipped</td>
                <td className="py-3 px-4 text-right">
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                    Human Insight
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-high/30 transition-colors">
                <td className="py-3 px-4 font-mono text-on-surface-variant">88</td>
                <td className="py-3 px-4 font-semibold text-on-surface">Type Annotations</td>
                <td className="py-3 px-4 text-on-surface-variant/60 italic">Skipped</td>
                <td className="py-3 px-4 text-on-surface">Suggest strict User interface</td>
                <td className="py-3 px-4 text-right">
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-tertiary/10 text-tertiary border border-tertiary/20">
                    AI Suggestion
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};
