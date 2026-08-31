import React, { useState } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { Play, Send, RotateCcw, CircleAlert, CheckCircle2, ChevronRight, Sparkles, TerminalSquare, AlertTriangle, ArrowLeft } from 'lucide-react';
import { PhaseOneProblem } from '@/data/codesight';
import { useAuth, DefectClass } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PracticeWorkspaceProps {
  problem: PhaseOneProblem;
  mode: 'student' | 'engineer';
  onBack: () => void;
  onViewResults: (results: any) => void;
}

export function PracticeWorkspace({ problem, mode, onBack, onViewResults }: PracticeWorkspaceProps) {
  const { addSubmission } = useAuth();
  
  // AI Engineer Mode receives broken / inefficient code by default
  const isEngineer = mode === 'engineer';
  const initialCode = isEngineer 
    ? (problem.topic === 'Loops' 
        ? `def solve_loops(value):\n    # AI Generated Code - Inspect for boundary bugs!\n    readings = [10, 20, 30, 40]\n    total = 0\n    for index in range(len(readings) - 1): # BUG: Off-by-one skips last item\n        total += readings[index]\n    return total / len(readings)` 
        : problem.starterCode)
    : problem.starterCode;

  const [code, setCode] = useState(initialCode);
  const [terminalOutput, setTerminalOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleReset = () => {
    setCode(initialCode);
    setTerminalOutput(null);
    toast('Code reset to starter state.');
  };

  const handleRun = () => {
    if (isEngineer) {
      toast.error('AI Engineer mode does NOT permit running code prior to submission!');
      return;
    }

    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setTerminalOutput(
        `$ python solution.py\nExecuting test suite...\n[PASS] Test Case 1: Input=10 -> Output=10\n[PASS] Test Case 2: Input=42 -> Output=${problem.expectedOutput}\n[INFO] Tests passed cleanly. Ready for complexity submit.`
      );
      toast.success('Code executed cleanly.');
    }, 600);
  };

  const handleSubmit = () => {
    let score = 100;
    let userTimeComplexity = 'O(N)';
    let userSpaceComplexity = 'O(1)';
    let optimalTimeComplexity = 'O(N)';
    let optimalSpaceComplexity = 'O(1)';
    let feedback = '';

    const defectClass: DefectClass = (problem.topic === 'Loops' ? 'Infinite Loops' : 'Unchecked Returns') as DefectClass;

    if (isEngineer) {
      // False Positive Trap Evaluation
      const isCodeEdited = code.trim() !== initialCode.trim();
      const isTrapProblem = problem.topic === 'Conditions'; // e.g. Conditions is already correct

      if (isTrapProblem && isCodeEdited) {
        // Penalty for altering correct code
        score = 0;
        feedback = 'FALSE POSITIVE TRAP: The AI code was already correct! Unnecessary modifications penalty applied.';
        toast.error('False Positive Trap: Unnecessary code modifications penalized.');
      } else if (isCodeEdited) {
        score = 100;
        feedback = 'FIX VERIFIED: Successfully identified and corrected the AI off-by-one boundary bug!';
        toast.success('AI Engineer Fix Verified! +100 Score');
      } else {
        score = 20;
        feedback = 'The AI-generated code contained a critical bug that was not fixed.';
        toast.error('Bug not resolved.');
      }
    } else {
      // Student Mode Complexity Evaluation
      const isQuadratic = code.includes('range(len(') && code.includes('in range');
      if (isQuadratic) {
        userTimeComplexity = 'O(N²)';
        // Optimal is O(N). 1 order worse -> Time Score: 25/50. Space: 50/50 -> Total: 75/100
        score = 75;
        feedback = 'Your code produced correct output, but used O(N²) quadratic time complexity. The optimal target is O(N).';
      } else {
        score = 100;
        feedback = 'Optimal Solution! Correct logic and optimal O(N) time complexity achieved.';
      }
    }

    const submissionResult = {
      problemId: problem.id,
      title: problem.title,
      score,
      mode,
      userTimeComplexity,
      userSpaceComplexity,
      optimalTimeComplexity,
      optimalSpaceComplexity,
      feedback,
      defectClass,
      concept: problem.concept,
      code
    };

    addSubmission(submissionResult);
    onViewResults(submissionResult);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] overflow-hidden rounded-2xl border border-[#D8D0C0] bg-[#ECE7DA] shadow-xl font-mono text-[#17130F]">
      {/* Workspace Top Bar (Matches Image Top Header) */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#D8D0C0] bg-[#F5F1E7] px-5 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-[#17130F] hover:underline"
          >
            <ArrowLeft size={14} /> Back to Problems
          </button>
          <span className="h-4 w-px bg-[#D8D0C0]" />
          <span className="mono rounded-md border border-[#D8D0C0] bg-[#EDE7D7] px-2.5 py-0.5 text-[10px] font-bold text-[#17130F] uppercase">
            {isEngineer ? 'AI ENGINEER MODE' : 'STUDENT SOLVE MODE'}
          </span>
          <span className="mono text-xs font-bold text-[#17130F]">{problem.title}</span>
        </div>

        <div className="flex items-center gap-2">
          {!isEngineer && (
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-1.5 rounded-xl border border-[#D8D0C0] bg-[#E2DCCF] px-4 py-2 text-xs font-bold text-[#17130F] hover:bg-[#D8D0C0] shadow-sm transition-all"
            >
              <Play size={12} fill="currentColor" /> Run Code
            </button>
          )}

          <button
            onClick={handleSubmit}
            className="flex items-center gap-1.5 rounded-xl bg-[#17130F] px-5 py-2 text-xs font-bold text-[#FFF7ED] hover:bg-[#2C241D] shadow-md transition-all"
          >
            <Send size={12} /> {isEngineer ? 'Submit Fix' : 'Submit Solution'}
          </button>
        </div>
      </div>

      {/* Resizable Draggable Panels Layout */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Panel 1: Problem Statement (Matches Image Left Panel) */}
          <Panel defaultSize={32} minSize={22}>
            <div className="h-full overflow-y-auto p-6 border-r border-[#D8D0C0] bg-[#F8F5EC] space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mono rounded-md border border-[#D8D0C0] bg-[#ECE7DA] px-2.5 py-1 text-[10px] font-bold text-[#17130F]">
                  {problem.difficulty}
                </span>
                <span className="mono rounded-md border border-[#D8D0C0] bg-[#ECE7DA] px-2.5 py-1 text-[10px] font-bold text-[#17130F]">
                  STUDENT PRACTICE
                </span>
                <span className="mono text-xs font-bold text-[#786F65] ml-auto">
                  Target: {problem.topic.includes('Resource') || problem.topic.includes('Performance') || problem.topic.includes('Error') ? 'O(1) / O(1)' : 'O(N) / O(1)'}
                </span>
              </div>

              <div>
                <h2 className="font-serif text-2xl font-extrabold text-[#17130F] tracking-tight">{problem.title}</h2>
                <div className="text-xs font-semibold text-[#786F65] mt-1">Topic: {problem.topic}</div>
              </div>

              <div className="text-xs leading-6 text-[#403A32]">
                {problem.description}
              </div>

              {/* Complexity & Safety Objective */}
              <div className="space-y-1.5 text-xs text-[#403A32]">
                <div className="font-bold text-[#17130F]">**Complexity &amp; Safety Objective**:</div>
                <div className="text-[11px] leading-5 text-[#655D54]">
                  - Single round-trip lookup: <strong>Time $O(1)$</strong>, <strong>Space $O(1)$</strong>.<br />
                  - Guard against missing inputs and unexpected <code className="bg-[#ECE7DA] px-1 py-0.5 rounded text-[#17130F]">None</code> values.
                </div>
              </div>

              {/* ALGORITHMIC REQUIREMENTS CARD BOX */}
              <div className="rounded-2xl border border-[#D8D0C0] bg-[#ECE7DA] p-4 text-xs space-y-2">
                <div className="mono text-[10px] font-bold tracking-wider text-[#17130F] uppercase">
                  ALGORITHMIC REQUIREMENTS:
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-[#655D54]">
                  <li>Optimal Time Complexity: O(1)</li>
                  <li>Optimal Space Complexity: O(1)</li>
                  <li>Guard against None/Null arguments and out-of-bound indices</li>
                </ul>
              </div>

              {isEngineer && (
                <div className="rounded-xl border border-[#C99700]/40 bg-[#F5E8C7] p-4 text-xs text-[#8A6300] space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <Sparkles size={14} /> AI ENGINEER TASK:
                  </div>
                  <div>Inspect the provided AI code. Fix any logical boundary errors or efficiency bugs. Submit when verified. Note: No RUN button is provided in AI Engineer mode.</div>
                </div>
              )}
            </div>
          </Panel>

          <PanelResizeHandle className="w-1.5 bg-[#D8D0C0] hover:bg-[#17130F] transition-colors cursor-col-resize" />

          {/* Panel 2: Code Editor (Matches Image Center Panel) */}
          <Panel defaultSize={43} minSize={28}>
            <div className="flex flex-col h-full bg-[#F5F1E7] text-[#17130F]">
              <div className="flex items-center justify-between border-b border-[#D8D0C0] bg-[#ECE7DA] px-4 py-2.5 text-xs font-mono">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#17130F]">solution.py</span>
                  <select className="rounded-md border border-[#D8D0C0] bg-[#F7F4EC] px-2 py-0.5 text-xs font-bold text-[#17130F] outline-none">
                    <option>Python 3</option>
                  </select>
                </div>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 text-xs font-bold text-[#786F65] hover:text-[#17130F]"
                >
                  <RotateCcw size={12} /> Reset
                </button>
              </div>

              <div className="flex-1 p-4 font-mono text-xs leading-6 overflow-y-auto bg-[#F5F1E7]">
                <textarea
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  spellCheck={false}
                  className="w-full h-full bg-transparent text-[#17130F] outline-none font-mono resize-none"
                />
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-1.5 bg-[#D8D0C0] hover:bg-[#17130F] transition-colors cursor-col-resize" />

          {/* Panel 3: Terminal Output (Matches Image Right Panel) */}
          <Panel defaultSize={25} minSize={15}>
            <div className="flex flex-col h-full bg-[#F8F5EC] border-l border-[#D8D0C0]">
              <div className="flex items-center justify-between border-b border-[#D8D0C0] bg-[#ECE7DA] px-4 py-2.5 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <TerminalSquare size={14} className="text-[#17130F]" />
                  <span className="font-bold text-[#17130F]">&gt;_ Terminal Output</span>
                </div>
                <span className="text-[11px] text-[#786F65]">Test Cases (3)</span>
              </div>

              <div className="flex-1 p-5 font-mono text-xs leading-6 overflow-y-auto text-[#17130F]">
                {terminalOutput ? (
                  <pre className="whitespace-pre-wrap">{terminalOutput}</pre>
                ) : (
                  <div className="text-[#786F65] italic">
                    {isEngineer 
                      ? 'AI Engineer mode does not permit running tests prior to submission. Inspect the code carefully.' 
                      : 'Click Run to execute test assertions or Submit to evaluate complexity.'}
                  </div>
                )}
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
