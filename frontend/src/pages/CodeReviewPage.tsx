import React, { useState } from 'react';
import { toast } from 'sonner';
import { Bug, CheckCircle2, CircleAlert, HelpCircle, Send } from 'lucide-react';
import { LiquidMetalCTA } from '../components/animations/LiquidMetalCTA';

export default function CodeReviewPage() {
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [defectClass, setDefectClass] = useState<string>('Concurrency & State');
  const [explanation, setExplanation] = useState<string>('');
  const [hintLevel, setHintLevel] = useState<number>(0);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const sampleCode = `async function processPayment(userId, amount) {
  const account = await db.findAccount(userId);

  // Line 4: Missing balance check before deduction
  account.balance -= amount;

  await db.saveAccount(account);
  return { status: "success", newBalance: account.balance };
}`;

  const hints = [
    'Hint 1: Check what happens when account.balance < amount. (-5 pts)',
    'Hint 2: Look at line 4 — is there any validation before subtraction? (-10 pts)',
    'Hint 3: Line 4 subtracts balance directly without verifying sufficient funds. (-15 pts)'
  ];

  const handleHint = () => {
    if (hintLevel < hints.length) {
      setHintLevel(prev => prev + 1);
      toast.info(hints[hintLevel]);
    }
  };

  const handleSubmit = () => {
    if (!selectedLine) {
      toast.error('Please select the line containing the defect.');
      return;
    }
    setSubmitted(true);
    toast.success('Code Review submitted! Review grade calculated.');
  };

  return (
    <div className="space-y-8 pb-12 text-[#17130F]">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#D8D0C0] pb-6 sm:flex-row sm:items-center font-mono">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#746D61]">
            AI CODE REVIEW WORKSPACE
          </div>
          <h1 className="mt-1 font-serif text-4xl font-extrabold text-[#17130F]">
            Audit & Localize Defect
          </h1>
        </div>

        <button
          onClick={handleHint}
          disabled={hintLevel >= hints.length}
          className="flex items-center gap-2 rounded-lg border border-[#D8D0C0] bg-[#F5F1E7] px-4 py-2 text-xs font-bold text-[#17130F] hover:bg-[#EDE7D7] disabled:opacity-50"
        >
          <HelpCircle size={14} />
          <span>REQUEST HINT ({hints.length - hintLevel} LEFT)</span>
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 font-mono">
        {/* Code Editor Panel */}
        <div className="lg:col-span-7 rounded-xl border border-[#D8D0C0] bg-[#F5F1E7] p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b border-[#D8D0C0] pb-3 text-xs">
            <span className="font-bold text-[#17130F]">payment_service.js</span>
            <span className="text-[#746D61]">Click a line to select defect location</span>
          </div>

          <div className="space-y-1 text-xs">
            {sampleCode.split('\n').map((lineText, idx) => {
              const lineNum = idx + 1;
              const isSelected = selectedLine === lineNum;

              return (
                <div
                  key={lineNum}
                  onClick={() => setSelectedLine(lineNum)}
                  className={`flex items-center gap-4 rounded-lg px-3 py-1.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'border border-[#17130F] bg-[#EDE7D7] text-[#17130F] font-bold'
                      : 'hover:bg-[#F2EEE3] text-[#403A32]'
                  }`}
                >
                  <span className="w-6 text-right text-[#746D61] select-none">{lineNum}</span>
                  <pre className="font-mono text-xs overflow-x-auto">
                    <code>{lineText}</code>
                  </pre>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit Form Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-[#D8D0C0] bg-[#F5F1E7] p-6 shadow-sm space-y-4 text-xs">
            <div>
              <label className="block mb-1 text-[#746D61] uppercase font-bold">Selected Line Number</label>
              <div className="rounded-lg border border-[#D8D0C0] bg-[#F8F5EC] p-3 font-bold text-[#17130F]">
                {selectedLine ? `Line ${selectedLine}` : 'No line selected (click line in code editor)'}
              </div>
            </div>

            <div>
              <label className="block mb-1 text-[#746D61] uppercase font-bold">Defect Taxonomy Class</label>
              <select
                value={defectClass}
                onChange={(e) => setDefectClass(e.target.value)}
                className="w-full rounded-lg border border-[#D8D0C0] bg-[#F8F5EC] p-3 text-[#17130F] font-bold outline-none"
              >
                <option>Injection / Input Validation</option>
                <option>Auth & Access Control</option>
                <option>Error & Exception Handling</option>
                <option>Concurrency & State</option>
                <option>Logic & Boundary</option>
                <option>Resource & Performance</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-[#746D61] uppercase font-bold">Root Cause Explanation</label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                rows={4}
                placeholder="Explain why this code fails..."
                className="w-full rounded-lg border border-[#D8D0C0] bg-[#F8F5EC] p-3 text-[#17130F] outline-none"
              />
            </div>

            <LiquidMetalCTA
              text="SUBMIT CODE REVIEW"
              icon="arrow"
              size="md"
              onClick={handleSubmit}
              className="w-full justify-center"
            />
          </div>

          {submitted && (
            <div className="rounded-xl border border-[#17130F] bg-[#F5F1E7] p-6 shadow-sm space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 font-bold text-[#17130F]">
                <CheckCircle2 size={18} />
                <span>GRADE: 95 / 100</span>
              </div>
              <p className="text-[#403A32]">
                Line 4 defect correctly identified as <strong>Concurrency & State</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
