/* Design philosophy: White + Blue Clean Developer Workspace. Phase 2 rewards independent investigation with semantic evidence, progressive disclosure, and clear visual feedback. */
import { useState } from 'react';
import { ArrowRight, Check, ChevronDown, CircleAlert, LockKeyhole, Send, Sparkles } from 'lucide-react';
import { Link } from 'wouter';
import { toast } from 'sonner';
import { AnalysisPanel, CodeEditor } from '@/components/code/CodeEditor';

const pill = (text: string, tone = 'slate') => (
  <span className={`rounded border px-2 py-0.5 mono text-[9px] font-bold uppercase tracking-[.08em] ${
    tone === 'mint' ? 'border-[#BBF7D0] bg-[#DCFCE7] text-[#16A34A]' :
    tone === 'coral' ? 'border-[#FECACA] bg-[#FEE2E2] text-[#DC2626]' :
    tone === 'amber' ? 'border-[#FDE68A] bg-[#FEF3C7] text-[#D97706]' :
    tone === 'purple' ? 'border-[#E9D5FF] bg-[#F3E8FF] text-[#9333EA]' :
    'border-[#E2E8F0] bg-[#F1F5F9] text-[#475569]'
  }`}>
    {text}
  </span>
);

export default function DebugArenaPage() {
  const [hintCount, setHintCount] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const score = revealed ? 50 : hintCount === 0 ? 100 : hintCount === 1 ? 85 : 70;

  const analyze = () => {
    setSubmitted(true);
    toast.success(`Bug found — ${score} XP earned for this diagnosis.`);
  };

  return (
    <>
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="diag-rail mb-3">
            <span className="mono text-[9px] text-[#64748B]">TRACE / ACTIVE</span>
            <span className="eyebrow text-[#2563EB]">Phase 2 / debug arena</span>
          </div>
          <h1 className="display text-[32px] font-semibold tracking-[-.055em] text-[#0F172A] sm:text-[40px]">
            Find the line that changes the story.
          </h1>
          <p className="mt-2 max-w-[640px] text-[13px] leading-5 text-[#64748B]">
            The Vanishing Index · Existing Python code · Investigate before you patch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {pill('PHASE 2', 'mint')}
          {pill('OFF-BY-ONE', 'coral')}
          <span className="mono text-[10px] font-bold text-[#D97706]">{score} XP available</span>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-[8px] border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-[11px] text-[#0F172A]">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-[#2563EB] mono text-[9px] font-bold text-[#FFFFFF]">02</span>
        <span><strong className="text-[#2563EB]">Investigate:</strong> identify the problematic line, explain the failure, then submit the fix.</span>
        <span className="ml-auto mono text-[10px] font-bold text-[#2563EB]">READ → FIND → EXPLAIN → FIX</span>
      </div>

      <div className="grid gap-4 xl:grid-cols-[.62fr_1.55fr_.78fr]">
        <div className="rounded-[12px] border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-sm">
          <div className="eyebrow text-[#2563EB]">Case file</div>
          <h2 className="display mt-3 text-[21px] font-semibold text-[#0F172A]">The Vanishing Index</h2>
          <p className="mt-3 text-[12px] leading-5 text-[#64748B]">
            A function should return the average of all readings. It runs without errors for some inputs, but the result is unexpectedly low.
          </p>

          <div className="mt-5 space-y-3 border-t border-[#E2E8F0] pt-4 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Input</span>
              <span className="mono font-semibold text-[#0F172A]">[18, 20, 22, 21]</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Expected</span>
              <span className="mono font-bold text-[#16A34A]">20.25</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Observed</span>
              <span className="mono font-bold text-[#DC2626]">20.00</span>
            </div>
          </div>

          <div className="mt-6 rounded-md border border-[#FDE68A] bg-[#FEF3C7]/40 p-3">
            <div className="eyebrow text-[#D97706]">Scoring signal</div>
            <div className="mt-2 flex items-end justify-between">
              <span className="display text-[25px] font-semibold text-[#D97706]">{score} XP</span>
              <span className="mono text-[9px] text-[#64748B]">
                {hintCount === 0 && !revealed ? 'NO HELP USED' : revealed ? 'LOCATION REVEALED' : `HINT ${hintCount}`}
              </span>
            </div>
            <p className="mt-2 text-[10px] leading-4 text-[#64748B]">Independent reasoning earns the strongest signal.</p>
          </div>
        </div>

        <CodeEditor/>

        <div className="space-y-3">
          <AnalysisPanel onHint={setHintCount}/>

          <div className="rounded-[12px] border border-[#E2E8F0] bg-[#FFFFFF] p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="eyebrow text-[#2563EB]">Reveal controls</span>
              <span className="mono text-[9px] text-[#64748B]">Optional</span>
            </div>

            {revealed ? (
              <div className="rounded-md border border-[#FECACA] bg-[#FEE2E2] p-3">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-[#DC2626]">
                  <CircleAlert size={13}/> Bug location: line 3
                </div>
                <p className="mt-2 text-[10px] leading-4 text-[#B91C1C]">The range ends before the final reading can be included.</p>
              </div>
            ) : (
              <button
                onClick={() => { setRevealed(true); toast('Location revealed — score adjusted to 50 XP.'); }}
                className="btn-warning flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-[11px] font-semibold"
              >
                Reveal bug location <LockKeyhole size={13}/>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-[12px] border border-[#E2E8F0] bg-[#FFFFFF] p-4 sm:flex-row sm:items-center shadow-sm">
        <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
          <span className="signal-dot"/> Submit once you can explain the boundary.
        </div>
        <button
          onClick={analyze}
          className="btn-success sm:ml-auto inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-[11px] font-bold shadow-sm"
        >
          <Send size={13}/> Submit fix
        </button>
      </div>

      {submitted && (
        <div className="animate-rise mt-4 rounded-[12px] border border-[#BBF7D0] bg-[#DCFCE7]/60 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#16A34A] text-[#FFFFFF]">
                <Check size={16}/>
              </span>
              <div>
                <div className="eyebrow text-[#16A34A]">Bug found</div>
                <h2 className="display mt-1 text-[20px] font-semibold text-[#0F172A]">Your explanation matches the evidence.</h2>
              </div>
            </div>
            <div className="text-right">
              <div className="display text-[26px] font-semibold text-[#D97706]">+{score} XP</div>
              <span className="mono text-[9px] font-bold text-[#16A34A]">PHASE 2 SIGNAL</span>
            </div>
          </div>

          <div className="mt-5 grid gap-4 border-t border-[#BBF7D0] pt-4 sm:grid-cols-2">
            <div>
              <div className="mono text-[9px] text-[#64748B]">BUG TYPE</div>
              <div className="mt-1 text-[12px] font-semibold text-[#DC2626]">Off-by-one error</div>
            </div>
            <div>
              <div className="mono text-[9px] text-[#64748B]">BUG LOCATION</div>
              <div className="mt-1 text-[12px] font-semibold text-[#0F172A]">Line 3</div>
            </div>
            <div>
              <div className="mono text-[9px] text-[#64748B]">CORRECT FIX</div>
              <div className="mt-1 text-[12px] font-semibold text-[#16A34A]">Include the final valid index in the loop boundary.</div>
            </div>
            <div>
              <div className="mono text-[9px] text-[#64748B]">LEARNING CONCEPT</div>
              <div className="mt-1 text-[12px] font-semibold text-[#0F172A]">Array indexing and loop boundaries.</div>
            </div>
          </div>

          <Link href="/learn" className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold text-[#2563EB]">
            Review the concept <ArrowRight size={13}/>
          </Link>
        </div>
      )}
    </>
  );
}
