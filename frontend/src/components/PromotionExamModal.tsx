import React, { useState, useEffect } from 'react';
import { Clock3, LockKeyhole, Send, AlertTriangle, CheckCircle2, ShieldAlert, X } from 'lucide-react';
import { useAuth, LEVEL_TIERS } from '@/contexts/AuthContext';
import { phaseOneProblems } from '@/data/codesight';
import { toast } from 'sonner';

interface PromotionExamModalProps {
  onClose: () => void;
}

export function PromotionExamModal({ onClose }: PromotionExamModalProps) {
  const { user, promoteUserLevel } = useAuth();
  
  // Timer setup: 10 minutes (600s)
  const [timeLeft, setTimeLeft] = useState(600);
  const [currentProblemIdx, setCurrentProblemIdx] = useState(0);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [passed, setPassed] = useState(false);

  const examProblems = phaseOneProblems.slice(0, 2);
  const currentProblem = examProblems[currentProblemIdx];

  const [answers, setAnswers] = useState<Record<string, string>>({
    [examProblems[0].id]: examProblems[0].starterCode,
    [examProblems[1].id]: examProblems[1].starterCode,
  });

  useEffect(() => {
    if (examSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examSubmitted]);

  const handleCodeChange = (newCode: string) => {
    setAnswers(prev => ({ ...prev, [currentProblem.id]: newCode }));
  };

  const handleFinalSubmit = () => {
    if (examSubmitted) return;
    setExamSubmitted(true);
    
    // Evaluate exam logic (e.g. check if code was edited/optimized)
    const isAnswered = Object.values(answers).some(a => a.trim().length > 30);
    const passResult = isAnswered; // Pass if attempted

    setPassed(passResult);

    if (passResult) {
      promoteUserLevel();
      toast.success('CONGRATULATIONS! Exam Passed! Next tier level unlocked.');
    } else {
      toast.error('Exam Failed. Level remains unchanged. Review concepts and retry.');
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0B0A0F] text-[#F5EFE6] p-6 overflow-hidden">
      {/* Exam Header */}
      <div className="flex items-center justify-between border-b border-[#2E2238] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#C96A32]">
            <ShieldAlert size={14} /> PROMOTION EXAM MODE · TIER GATE
          </div>
          <h1 className="text-xl font-bold mt-1 text-[#F5EFE6]">
            Exam for Tier {user.levelIndex + 1}: {user.level}
          </h1>
        </div>

        {/* Timer & Controls */}
        <div className="flex items-center gap-6">
          {!examSubmitted && (
            <div className="flex items-center gap-2 font-mono text-base font-bold bg-[#17121C] border border-[#2E2238] px-4 py-2 rounded-lg text-[#C96A32]">
              <Clock3 size={18} /> {formatTime(timeLeft)}
            </div>
          )}

          <button
            onClick={onClose}
            className="text-xs text-[#AAA2B5] hover:text-white transition-colors"
          >
            Exit Exam
          </button>
        </div>
      </div>

      {!examSubmitted ? (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 py-6 overflow-hidden">
          {/* Left: Problem Brief */}
          <div className="rounded-xl border border-[#2E2238] bg-[#17121C] p-5 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <span className="mono text-xs text-[#C96A32]">
                Problem {currentProblemIdx + 1} of {examProblems.length}
              </span>
              <span className="bg-[#2E2238] text-xs px-2.5 py-1 rounded text-[#C9A7FF]">
                {currentProblem.topic}
              </span>
            </div>

            <h2 className="text-lg font-bold text-[#F5EFE6]">{currentProblem.title}</h2>
            <p className="text-xs text-[#AAA2B5] leading-6">{currentProblem.prompt}</p>

            <div className="rounded-lg bg-[#0B0A0F] border border-[#2E2238] p-3 text-xs text-[#C96A32]">
              <strong>Exam Restriction:</strong> NO RUN button is permitted during Promotion Exams. Write clean, verified code before submitting.
            </div>
          </div>

          {/* Right: Code Editor & Navigation */}
          <div className="rounded-xl border border-[#2E2238] bg-[#17121C] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#2E2238] bg-[#0B0A0F] px-4 py-2.5 text-xs font-mono">
              <span className="text-[#C9A7FF]">solution.py</span>
              <span className="text-[#EF4444]">NO RUN BUTTON</span>
            </div>

            <div className="flex-1 p-4 font-mono text-xs bg-[#0B0A0F] text-[#F5EFE6]">
              <textarea
                value={answers[currentProblem.id] || ''}
                onChange={e => handleCodeChange(e.target.value)}
                spellCheck={false}
                className="w-full h-full bg-transparent text-[#F5EFE6] outline-none font-mono resize-none"
              />
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between border-t border-[#2E2238] bg-[#17121C] px-4 py-3">
              <div className="flex gap-2">
                {examProblems.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentProblemIdx(idx)}
                    className={`px-3 py-1 rounded text-xs font-mono ${
                      currentProblemIdx === idx ? 'bg-[#C96A32] text-white' : 'bg-[#2E2238] text-[#AAA2B5]'
                    }`}
                  >
                    P{idx + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={handleFinalSubmit}
                className="btn-primary flex items-center gap-1.5 rounded-lg px-5 py-2 text-xs font-bold shadow-lg"
              >
                <Send size={14} /> Submit Final Exam
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Exam Results Overlay */
        <div className="my-auto max-w-lg mx-auto w-full rounded-2xl border border-[#2E2238] bg-[#17121C] p-8 text-center space-y-6">
          <div className={`mx-auto h-20 w-20 rounded-full flex items-center justify-center ${
            passed ? 'bg-[#14532D] text-[#4ADE80]' : 'bg-[#7F1D1D] text-[#EF4444]'
          }`}>
            {passed ? <CheckCircle2 size={40} /> : <AlertTriangle size={40} />}
          </div>

          <h2 className="text-3xl font-bold">{passed ? 'PROMOTION EXAM PASSED!' : 'EXAM FAILED'}</h2>

          <p className="text-xs text-[#AAA2B5] leading-6">
            {passed
              ? `You passed the exam! Unlocked next level: Tier ${user.levelIndex + 1} (${LEVEL_TIERS[user.levelIndex]})`
              : 'You did not achieve the required threshold. Review your weak defect classes and try again.'}
          </p>

          <button
            onClick={onClose}
            className="btn-primary rounded-lg px-8 py-3 text-xs font-bold shadow-xl"
          >
            Return to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
