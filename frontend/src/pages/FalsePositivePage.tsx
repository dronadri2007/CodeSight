import React, { useState } from 'react';
import { toast } from 'sonner';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { LiquidMetalCTA } from '../components/animations/LiquidMetalCTA';

export default function FalsePositivePage() {
  const [submittedClean, setSubmittedClean] = useState(false);

  const cleanCode = `// Clean, bug-free utility function
function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, curr) => acc + curr, 0);
  return sum / numbers.length;
}`;

  const handleZeroFindings = () => {
    setSubmittedClean(true);
    toast.success('Zero findings submitted! Perfect precision score +100.');
  };

  return (
    <div className="space-y-8 pb-12 text-[#17130F]">
      <div className="border-b border-[#D8D0C0] pb-6 font-mono">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#746D61]">
          <ShieldCheck size={14} className="text-[#17130F]" />
          <span>RESTRAINT & PRECISION CHALLENGE</span>
        </div>
        <h1 className="mt-1 font-serif text-4xl font-bold text-[#17130F]">
          False Positive Challenge
        </h1>
        <p className="mt-1 text-sm text-[#403A32]">
          Train restraint by recognizing clean, safe code. Submit zero findings when no defects exist.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-xl border border-[#D8D0C0] bg-[#F5F1E7] p-6 shadow-sm font-mono text-xs">
          <div className="mb-4 flex items-center justify-between border-b border-[#D8D0C0] pb-3 text-[#17130F]">
            <span className="font-bold">math_utils.ts</span>
            <span className="text-[#746D61]">Is there actually a defect?</span>
          </div>

          <pre className="text-[#17130F] leading-relaxed">
            <code>{cleanCode}</code>
          </pre>
        </div>

        <div className="space-y-6 rounded-xl border border-[#D8D0C0] bg-[#F5F1E7] p-6 shadow-sm font-mono text-xs">
          <div>
            <span className="font-bold text-[#746D61] uppercase">AUDIT VERDICT</span>
            <h3 className="mt-1 font-serif text-2xl font-bold text-[#17130F]">
              Evaluate Restraint
            </h3>
            <p className="mt-2 text-[#403A32]">
              If this code is clean, submit zero findings. Avoid over-flagging false alarms.
            </p>
          </div>

          <div className="pt-4">
            <LiquidMetalCTA
              text="SUBMIT ZERO FINDINGS (CLEAN CODE)"
              icon="shield"
              onClick={handleZeroFindings}
              className="w-full justify-center"
            />
          </div>

          {submittedClean && (
            <div className="rounded-xl border border-[#17130F] bg-[#F8F5EC] p-4 text-[#17130F]">
              <div className="flex items-center gap-2 font-bold text-[#17130F]">
                <CheckCircle2 size={16} />
                <span>CORRECT VERDICT</span>
              </div>
              <p className="mt-2 text-[#403A32]">
                Code is 100% clean. Zero false positives reported. Precision score maxed out!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
