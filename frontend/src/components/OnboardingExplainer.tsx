import React, { useState, useEffect } from 'react';
import { ArrowRight, Check, ChevronRight, Code2, Cpu, ShieldAlert, Sparkles, Trophy, Zap, X, UserCheck, Flame } from 'lucide-react';

interface OnboardingExplainerProps {
  onComplete: () => void;
  onOpenAuth: () => void;
}

export function OnboardingExplainer({ onComplete, onOpenAuth }: OnboardingExplainerProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [subAnimStage, setSubAnimStage] = useState<number>(1);
  const [showGetStarted, setShowGetStarted] = useState<boolean>(false);

  // Sequential animation timing engine
  useEffect(() => {
    setSubAnimStage(1);
    
    if (step === 1) {
      const t1 = setTimeout(() => setSubAnimStage(2), 1200);
      const t2 = setTimeout(() => setSubAnimStage(3), 2600);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else if (step === 2) {
      const t1 = setTimeout(() => setSubAnimStage(2), 1400);
      const t2 = setTimeout(() => setSubAnimStage(3), 2800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else if (step === 3) {
      const t1 = setTimeout(() => setSubAnimStage(2), 1000);
      const t2 = setTimeout(() => setSubAnimStage(3), 2200);
      const t3 = setTimeout(() => {
        setSubAnimStage(4);
        setShowGetStarted(true);
      }, 3400);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [step]);

  const handleNext = () => {
    if (step < 3) {
      setStep((step + 1) as 1 | 2 | 3);
    } else {
      onOpenAuth();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2 | 3);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans bg-[#090909] text-[#FFF7ED]">
      {/* Layer 1: Full-Screen Background Image (100vw, 100vh, cover, center, no-repeat) */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: "url('/assets/images/codesight-hero-bg.jpg')" }}
      />

      {/* Layer 2: Dark Obsidian Semi-Transparent Overlay & Ambient Warm Radial Glow */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#090909]/94 via-[#090909]/88 to-[#090909]/94 backdrop-blur-[2px] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(234,88,12,0.14),transparent_65%)] pointer-events-none" />

      {/* Layer 3: Foreground Animated CodeSight Content */}
      <div className="relative z-10 flex flex-col justify-between min-h-full p-6 sm:p-12">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="brand-mark brand-mark-orange">
              <span className="brand-mark__bracket brand-mark__bracket--left">&lt;</span>
              <span className="brand-mark__sight" />
              <span className="brand-mark__bracket brand-mark__bracket--right">&gt;</span>
            </div>
            <span className="display text-xl font-bold tracking-tight text-[#FFF7ED]">CodeSight</span>
          </div>

          {/* Step Indicators & Skip */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <button
                  key={s}
                  onClick={() => setStep(s as 1 | 2 | 3)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    step === s ? 'w-8 bg-[#EA580C]' : 'w-2.5 bg-[#2A211C] hover:bg-[#C2410C]'
                  }`}
                  aria-label={`Go to step ${s}`}
                />
              ))}
            </div>

            <button
              onClick={onComplete}
              className="flex items-center gap-1 text-xs text-[#D6C8BC] hover:text-[#FFF7ED] transition-colors"
            >
              Skip to App <X size={14} />
            </button>
          </div>
        </div>

      {/* Main Slide Content */}
      <div className="my-auto py-8 max-w-5xl mx-auto w-full">
        {step === 1 && (
          <div className="animate-rise space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <span className="eyebrow text-[#FB923C]">STEP 1 / 3 — STUDENT EXPERIENCE</span>
              <h1 className="display text-3xl sm:text-5xl font-bold mt-3 leading-tight text-[#FFF7ED]">
                Students write code. <br />
                <span className="bg-gradient-to-r from-[#EA580C] to-[#FB923C] bg-clip-text text-transparent">
                  AI finds optimization opportunities.
                </span>
              </h1>
              <p className="mt-4 text-[#D6C8BC] text-sm sm:text-base">
                CodeSight goes beyond simple pass/fail. Learn to analyze time and space complexity in real time.
              </p>
            </div>

            {/* Step 1 Sequential Cinematic Flow */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center pt-6">
              {/* Stage 1: Student Code Snippet */}
              <div className={`rounded-xl border border-[#2A211C] bg-[#171412] p-5 shadow-xl transition-all duration-500 ${
                subAnimStage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <div className="flex items-center justify-between text-xs text-[#FB923C] font-mono mb-2">
                  <span className="flex items-center gap-1.5"><Code2 size={16} /> 01. STUDENT CODE</span>
                  <span className="text-[10px] text-[#FED7AA] bg-[#C2410C]/20 border border-[#C2410C]/40 px-2 py-0.5 rounded">Quadratic O(N²)</span>
                </div>
                <div className="font-mono text-xs text-[#FFF7ED] space-y-1 bg-[#090909] p-3 rounded-lg border border-[#2A211C]">
                  <div><span className="text-[#FB923C]">def</span> find_dup(arr):</div>
                  <div className="pl-3 text-[#D6C8BC]"># Quadratic loop</div>
                  <div className="pl-3"><span className="text-[#FB923C]">for</span> i <span className="text-[#FB923C]">in</span> arr:</div>
                  <div className="pl-6"><span className="text-[#FB923C]">if</span> arr.count(i) &gt; 1:</div>
                  <div className="pl-9 text-[#FB923C]">return i</div>
                </div>
              </div>

              {/* Stage 2: Complexity Engine Analysis */}
              <div className={`rounded-xl border border-[#EA580C] bg-[#171412] p-5 shadow-xl transition-all duration-500 ${
                subAnimStage >= 2 ? 'opacity-100 scale-100' : 'opacity-20 scale-95'
              }`}>
                <div className="flex items-center justify-between text-xs font-mono text-[#EA580C] mb-3">
                  <span className="flex items-center gap-1.5"><Cpu size={16} /> 02. COMPLEXITY ENGINE</span>
                  {subAnimStage >= 2 && <span className="animate-pulse text-[10px] text-[#FB923C]">ANALYZING...</span>}
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 rounded bg-[#090909]">
                    <span className="text-[#D6C8BC]">User Complexity:</span>
                    <span className="font-mono text-[#EF4444] font-bold">O(N²)</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[#090909]">
                    <span className="text-[#D6C8BC]">Optimal Target:</span>
                    <span className="font-mono text-[#22C55E] font-bold">O(N)</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[#090909]">
                    <span className="text-[#D6C8BC]">Time Penalty:</span>
                    <span className="font-mono text-[#FB923C]">-25 pts</span>
                  </div>
                </div>
              </div>

              {/* Stage 3: Optimization Score Feedback */}
              <div className={`rounded-xl border border-[#22C55E] bg-[#171412] p-5 shadow-xl transition-all duration-500 ${
                subAnimStage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <div className="flex items-center justify-between text-xs font-mono text-[#22C55E] mb-2">
                  <span className="flex items-center gap-1.5"><Sparkles size={16} /> 03. OPTIMIZATION SCORE</span>
                  <span className="bg-[#166534]/30 text-[#4ADE80] px-2 py-0.5 rounded text-[10px]">VERIFIED</span>
                </div>
                <div className="text-center py-2">
                  <div className="text-4xl font-bold font-mono text-[#FB923C]">75 / 100</div>
                  <div className="text-[11px] text-[#D6C8BC] mt-1">Time: 25/50 · Space: 50/50</div>
                </div>
                <div className="mt-2 text-[11px] text-[#4ADE80] bg-[#166534]/30 p-2.5 rounded border border-[#22C55E]/40 leading-5">
                  Recommendation: Convert quadratic count lookup to HashSet for O(N) linear performance.
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-rise space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <span className="eyebrow text-[#FB923C]">STEP 2 / 3 — AI ENGINEER EXPERIENCE</span>
              <h1 className="display text-3xl sm:text-5xl font-bold mt-3 leading-tight text-[#FFF7ED]">
                AI Engineers review &amp; fix <br />
                <span className="bg-gradient-to-r from-[#EA580C] to-[#FB923C] bg-clip-text text-transparent">
                  broken AI-generated code.
                </span>
              </h1>
              <p className="mt-4 text-[#D6C8BC] text-sm sm:text-base">
                Inspect AI code, catch false positives, fix hidden edge-case bugs, and optimize production pipelines.
              </p>
            </div>

            {/* Step 2 Sequential Cinematic Flow */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center pt-6">
              {/* Stage 1: Buggy AI Code */}
              <div className={`rounded-xl border border-[#EF4444]/60 bg-[#171412] p-5 shadow-xl transition-all duration-500 ${
                subAnimStage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <div className="flex items-center justify-between text-xs font-mono text-[#EF4444] mb-3">
                  <span className="flex items-center gap-1.5"><ShieldAlert size={16} /> AI CODE HAS BUG</span>
                  <span className="bg-[#7F1D1D] text-white px-2 py-0.5 rounded text-[10px]">BUGGY</span>
                </div>
                <div className="font-mono text-xs bg-[#090909] p-3 rounded-lg text-[#D6C8BC] space-y-1">
                  <div><span className="text-[#FB923C]">def</span> calc_avg(vals):</div>
                  <div className="text-[#EF4444] bg-[#7F1D1D]/40 p-1.5 rounded">
                    return sum(vals) / len(vals) # ZeroDivisionError!
                  </div>
                </div>
              </div>

              {/* Stage 2: Inspection & False Positive Detection */}
              <div className={`flex flex-col items-center justify-center text-center space-y-3 transition-all duration-500 ${
                subAnimStage >= 2 ? 'opacity-100 scale-100' : 'opacity-20 scale-90'
              }`}>
                <div className="h-12 w-12 rounded-full bg-[#EA580C] text-[#FFF7ED] flex items-center justify-center font-bold text-sm shadow-lg">
                  <UserCheck size={22} />
                </div>
                <div className="text-xs font-bold text-[#FB923C]">
                  AI ENGINEER INSPECTS CODE
                </div>
                <div className="text-[11px] text-[#D6C8BC] max-w-[200px]">
                  Detects empty array crash &amp; missing guard clause.
                </div>
              </div>

              {/* Stage 3: Corrected Fix */}
              <div className={`rounded-xl border border-[#22C55E]/60 bg-[#171412] p-5 shadow-xl transition-all duration-500 ${
                subAnimStage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <div className="flex items-center justify-between text-xs font-mono text-[#22C55E] mb-3">
                  <span className="flex items-center gap-1.5"><Check size={16} /> AI ENGINEER FIX</span>
                  <span className="bg-[#14532D] text-white px-2 py-0.5 rounded text-[10px]">VERIFIED</span>
                </div>
                <div className="font-mono text-xs bg-[#090909] p-3 rounded-lg text-[#FFF7ED] space-y-1">
                  <div><span className="text-[#FB923C]">def</span> calc_avg(vals):</div>
                  <div className="text-[#4ADE80] bg-[#14532D]/40 p-1.5 rounded">
                    if not vals: return 0.0 # Guard clause added!
                  </div>
                  <div>return sum(vals) / len(vals)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-rise space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <span className="eyebrow text-[#FB923C]">STEP 3 / 3 — PROGRESSION &amp; WEAKNESS TRACKING</span>
              <h1 className="display text-3xl sm:text-5xl font-bold mt-3 leading-tight text-[#FFF7ED]">
                Level up through 6 tiers. <br />
                <span className="bg-gradient-to-r from-[#EA580C] to-[#FB923C] bg-clip-text text-transparent">
                  Track and eliminate your weaknesses.
                </span>
              </h1>
              <p className="mt-4 text-[#D6C8BC] text-sm sm:text-base">
                Pass rigorous Promotion Exams to unlock higher tiers. Track defect classes like Race Conditions &amp; Memory Leaks.
              </p>
            </div>

            {/* Step 3 Sequential Reveal of 6 Tiers */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-4">
              {[
                { name: 'Student Beginner', lvl: '1', delayStage: 1 },
                { name: 'Student Interm.', lvl: '2', delayStage: 1 },
                { name: 'Student Pro', lvl: '3', delayStage: 2 },
                { name: 'AI Eng. Beginner', lvl: '4', delayStage: 2 },
                { name: 'AI Eng. Interm.', lvl: '5', delayStage: 3 },
                { name: 'AI Eng. Pro', lvl: '6', delayStage: 3 },
              ].map((tier) => {
                const active = subAnimStage >= tier.delayStage;
                return (
                  <div
                    key={tier.lvl}
                    className={`rounded-xl border p-3.5 text-center transition-all duration-500 ${
                      active
                        ? 'border-[#EA580C] bg-[#171412] text-[#FFF7ED] shadow-lg scale-100'
                        : 'border-[#2A211C] bg-[#090909] text-[#D6C8BC] opacity-30 scale-95'
                    }`}
                  >
                    <div className="mono text-[10px] uppercase tracking-wider font-bold text-[#FB923C]">Tier {tier.lvl}</div>
                    <div className="text-xs font-bold mt-1">{tier.name}</div>
                    <Trophy size={14} className={`mx-auto mt-2 ${active ? 'text-[#EA580C]' : 'opacity-30'}`} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls & GET STARTED */}
      <div className="flex items-center justify-between border-t border-[#2A211C] pt-6 max-w-5xl mx-auto w-full">
        <button
          onClick={handlePrev}
          disabled={step === 1}
          className={`px-5 py-2.5 rounded-lg text-xs font-semibold border transition-colors ${
            step === 1 ? 'opacity-30 cursor-not-allowed border-[#2A211C] text-[#D6C8BC]' : 'border-[#2A211C] text-[#FFF7ED] hover:bg-[#171412]'
          }`}
        >
          Previous
        </button>

        <div className="flex items-center gap-3">
          {step < 3 ? (
            <button
              onClick={handleNext}
              className="btn-burnt-orange px-6 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg"
            >
              Next Step <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className={`btn-burnt-orange px-8 py-3 rounded-lg text-sm font-bold flex items-center gap-2.5 shadow-2xl transition-all duration-500 ${
                showGetStarted ? 'opacity-100 scale-100' : 'opacity-80 scale-95'
              }`}
            >
              <Zap size={18} fill="currentColor" /> GET STARTED NOW
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}
