/* Design philosophy: White + Blue Clean Developer Workspace. Royal Blue (#2563EB) accents, high-contrast code presentation, and semantic status indicators. */
import { useState } from 'react';
import { Check, ChevronDown, CircleAlert, Play, RotateCcw, Send, TerminalSquare, Sparkles } from 'lucide-react';
import { codeLines } from '@/data/codesight';
import { toast } from 'sonner';

export function CodeEditor() {
  const [selected, setSelected] = useState(3);
  const [ran, setRan] = useState(false);

  return (
    <div className="overflow-hidden rounded-[12px] border border-[#E2E8F0] bg-[#FFFFFF] shadow-md">
      {/* Editor Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#DC2626]"/>
            <span className="h-2.5 w-2.5 rounded-full bg-[#D97706]"/>
            <span className="h-2.5 w-2.5 rounded-full bg-[#16A34A]"/>
          </div>
          <span className="mono text-[11px] font-medium text-[#0F172A]">average_temperature.py</span>
          <span className="rounded border border-[#BFDBFE] bg-[#EFF6FF] px-1.5 py-0.5 mono text-[9px] font-semibold text-[#2563EB]">PYTHON</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn-secondary flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[10px] font-medium transition-colors"
            onClick={() => { setRan(false); toast('Editor reset to the original bug.'); }}
          >
            <RotateCcw size={12}/> Reset
          </button>
          <button
            className="btn-primary flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[10px] font-bold shadow-sm transition-transform hover:-translate-y-px"
            onClick={() => { setRan(true); toast.success('Run complete — read the evidence below.'); }}
          >
            <Play size={12} fill="currentColor"/> Run code
          </button>
        </div>
      </div>

      {/* Code Editor Surface */}
      <div className="overflow-x-auto bg-[#0F172A] py-3 text-[#F8FAFC]">
        <div className="min-w-[540px] mono text-[12px] leading-7">
          {codeLines.map((line, index) => {
            const lineNo = index + 1;
            const bug = lineNo === 3;
            const active = selected === lineNo;

            return (
              <button
                key={lineNo}
                onClick={() => setSelected(lineNo)}
                className={`flex w-full items-center text-left transition-colors ${active ? 'bg-[#1E293B]' : 'hover:bg-[#1E293B]/60'}`}
              >
                <span className={`relative w-12 shrink-0 select-none pr-4 text-right text-[11px] ${active ? 'text-[#60A5FA]' : 'text-[#64748B]'}`}>
                  {bug && <CircleAlert size={12} className="absolute right-1 top-2 text-[#EF4444]"/>}
                  {lineNo}
                </span>
                <span className={`border-l px-3 ${active ? 'border-[#3B82F6]' : bug ? 'border-[#EF4444]' : 'border-transparent'}`}>
                  <span className="text-[#F8FAFC]">
                    {line.includes('def') ? (
                      <><span className="text-[#F59E0B]">def</span> <span className="text-[#38BDF8]">average_temperature</span><span className="text-[#F8FAFC]">(readings):</span></>
                    ) : line.includes('for') ? (
                      <><span className="text-[#F59E0B]">for</span> <span className="text-[#F59E0B]">index</span> <span className="text-[#F59E0B]">in</span> <span className="text-[#38BDF8]">range</span><span className="text-[#F8FAFC]">(len(readings) - 1):</span></>
                    ) : line.includes('return') ? (
                      <><span className="text-[#F59E0B]">return</span> {line.replace('return ', '')}</>
                    ) : (
                      line
                    )}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor Status Bar */}
      <div className="flex items-center justify-between border-t border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5">
        <div className="flex items-center gap-2 text-[10px] text-[#64748B]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626]"/> 1 issue found
          <span className="ml-2 h-1.5 w-1.5 rounded-full bg-[#D97706]"/> 1 hint available
        </div>
        <button
          className="btn-success flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[10px] font-bold transition-transform hover:-translate-y-px"
          onClick={() => toast.success('Diagnosis submitted for review.')}
        >
          Submit diagnosis <Send size={11}/>
        </button>
      </div>

      {/* Diagnostics Terminal Output */}
      <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] p-4">
        <div className="mb-2 flex items-center gap-2">
          <TerminalSquare size={13} className="text-[#2563EB]"/>
          <span className="eyebrow text-[#2563EB]">Terminal / output</span>
        </div>
        <div className="mono text-[11px] leading-5 text-[#0F172A]">
          $ python average_temperature.py<br/>
          <span className={ran ? 'font-semibold text-[#DC2626]' : 'text-[#64748B]'}>
            {ran ? 'IndexError: list index out of range' : 'Run the code to inspect its output.'}
          </span>
        </div>
      </div>
    </div>
  );
}

export function AnalysisPanel({ onHint }: { onHint: (n: number) => void }) {
  const [hints, setHints] = useState(0);
  const reveal = () => {
    const next = Math.min(hints + 1, 3);
    setHints(next);
    onHint(next);
  };

  return (
    <div className="space-y-3">
      {/* AI Assistant Card */}
      <div className="rounded-[12px] border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#9333EA]">
            <Sparkles size={14} />
            <span className="eyebrow text-[#9333EA]">AI Debug Assistant</span>
          </div>
          <span className="badge-expert rounded-full border px-2 py-0.5 mono text-[9px] font-bold">
            ANALYZING
          </span>
        </div>

        <h3 className="display text-[17px] font-semibold text-[#0F172A]">Start with the loop boundary.</h3>
        <p className="mt-2 text-[12px] leading-5 text-[#64748B]">
          The output tells us the program is reading outside the collection. Inspect the range on line 3 before changing the return value.
        </p>

        <div className="mt-4 flex items-start gap-2.5 rounded-md border border-[#FECACA] bg-[#FEE2E2] p-3.5">
          <CircleAlert className="mt-0.5 shrink-0 text-[#DC2626]" size={15}/>
          <div>
            <div className="mono text-[10px] font-bold text-[#DC2626]">BUG LOCATION · LINE 3</div>
            <p className="mt-1 text-[11px] text-[#B91C1C]">
              The loop stops one item too early, but the current failure is a boundary mismatch.
            </p>
          </div>
        </div>
      </div>

      {/* Progressive Hints Card */}
      <div className="rounded-[12px] border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="eyebrow text-[#2563EB]">Progressive hints</span>
          <span className="mono text-[10px] text-[#64748B]">{hints}/3 revealed</span>
        </div>

        {hints > 0 && (
          <div className="space-y-2">
            {[
              'Think about the variable used in the loop.',
              'Check whether the loop condition reaches the intended boundary.',
              'Look at line 3. What does -1 change?'
            ].slice(0, hints).map((hint, i) => (
              <div key={hint} className="animate-rise flex gap-2 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-[11px] leading-4 text-[#0F172A]">
                <span className="mono font-bold text-[#2563EB]">0{i+1}</span>
                {hint}
              </div>
            ))}
          </div>
        )}

        {hints < 3 ? (
          <button
            onClick={reveal}
            className="btn-special mt-3 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-semibold"
          >
            Reveal next hint <ChevronDown size={13}/>
          </button>
        ) : (
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#16A34A]">
            <Check size={13}/> All hints explored
          </div>
        )}
      </div>
    </div>
  );
}
