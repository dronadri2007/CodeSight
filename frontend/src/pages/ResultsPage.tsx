import React from 'react';
import { Trophy, CheckCircle2, AlertTriangle, ArrowRight, BookOpen, RotateCcw, Home } from 'lucide-react';
import { SubmissionRecord } from '@/contexts/AuthContext';

interface ResultsPageProps {
  results: any;
  onNext: () => void;
  onLearn: (defect: string) => void;
  onHome: () => void;
}

export function ResultsPage({ results, onNext, onLearn, onHome }: ResultsPageProps) {
  const isPass = results.score >= 70;

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4 animate-rise">
      {/* Top Banner Card */}
      <div className={`rounded-xl border p-6 text-center shadow-lg ${
        isPass 
          ? 'border-[#22C55E]/40 bg-[#22C55E]/10 text-[#4ADE80]'
          : 'border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444]'
      }`}>
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#17121C] shadow-md mb-3 border border-[#2E2238]">
          {isPass ? <Trophy size={32} className="text-[#4ADE80]" /> : <AlertTriangle size={32} className="text-[#EF4444]" />}
        </div>
        <h1 className="display text-3xl font-bold text-[#F5EFE6]">{isPass ? 'Submission Successful!' : 'Optimization Needed'}</h1>
        <p className="mt-1 text-xs text-[#AAA2B5]">{results.title} · {results.mode === 'engineer' ? 'AI Engineer Evaluation' : 'Student Evaluation'}</p>

        {/* Score Ring / Pill */}
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#2E2238] bg-[#0B0A0F] px-5 py-2 text-xl font-bold font-mono shadow-sm">
          <span className="text-[#AAA2B5]">SCORE:</span>
          <span className={isPass ? 'text-[#4ADE80]' : 'text-[#EF4444]'}>{results.score} / 100</span>
        </div>
      </div>

      {/* Visual Complexity Comparison Table */}
      <div className="rounded-xl border border-[#2E2238] bg-[#17121C] p-6 shadow-sm space-y-4">
        <h2 className="display text-lg font-semibold text-[#F5EFE6]">Complexity Analysis</h2>
        
        <div className="grid grid-cols-2 gap-4 text-xs">
          {/* User Code */}
          <div className="rounded-lg border border-[#2E2238] bg-[#0B0A0F] p-4 space-y-2">
            <div className="mono font-bold text-[#AAA2B5]">YOUR CODE</div>
            <div className="flex justify-between font-mono">
              <span className="text-[#AAA2B5]">Time Complexity:</span>
              <span className={`font-bold ${results.userTimeComplexity === results.optimalTimeComplexity ? 'text-[#4ADE80]' : 'text-[#FCA5A5]'}`}>
                {results.userTimeComplexity}
              </span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-[#AAA2B5]">Space Complexity:</span>
              <span className="font-bold text-[#4ADE80]">{results.userSpaceComplexity}</span>
            </div>
          </div>

          {/* Optimal Target */}
          <div className="rounded-lg border border-[#C96A32]/40 bg-[#211827] p-4 space-y-2">
            <div className="mono font-bold text-[#C96A32]">OPTIMAL TARGET</div>
            <div className="flex justify-between font-mono">
              <span className="text-[#AAA2B5]">Time Complexity:</span>
              <span className="font-bold text-[#C9A7FF]">{results.optimalTimeComplexity}</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-[#AAA2B5]">Space Complexity:</span>
              <span className="font-bold text-[#C9A7FF]">{results.optimalSpaceComplexity}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Feedback Card */}
      <div className="rounded-xl border border-[#2E2238] bg-[#17121C] p-6 shadow-sm space-y-3">
        <div className="eyebrow text-[#C96A32]">AI FEEDBACK &amp; INSIGHTS</div>
        <p className="text-xs leading-6 text-[#F5EFE6] bg-[#0B0A0F] p-4 rounded-lg border border-[#2E2238]">
          {results.feedback}
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={onHome}
          className="btn-secondary flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-semibold border border-[#2E2238] bg-[#211827] text-[#F5EFE6]"
        >
          <Home size={14} /> Back to Home
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => onLearn(results.defectClass)}
            className="btn-secondary flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-semibold border border-[#C96A32]/40 bg-[#211827] text-[#C9A7FF]"
          >
            <BookOpen size={14} /> Learn the Concept
          </button>
          <button
            onClick={onNext}
            className="btn-primary flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-xs font-bold shadow-md"
          >
            Next Exercise <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
