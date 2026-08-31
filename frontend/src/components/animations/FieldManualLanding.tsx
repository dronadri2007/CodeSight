import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn, BookOpen, Sparkles, Layers, ShieldAlert, Cpu, Award, Zap, Code2 } from 'lucide-react';

export interface FieldManualPlate {
  id: number;
  title: string;
  subtitle: string;
  eyebrow: string;
  content: string;
  highlight: string;
  icon: React.ElementType;
  codeSnippet?: string;
  diagram?: { label: string; detail: string };
  badgeText: string;
}

const PLATES: FieldManualPlate[] = [
  {
    id: 1,
    eyebrow: 'PLATE 01 / INTRODUCTION',
    title: 'CODESIGHT',
    subtitle: 'TRAIN YOUR EYE FOR CODE.',
    content: "Don't just write code. Learn to see what hides inside it. CodeSight develops both sides of developer mastery: writing optimal algorithms and critically reviewing AI-generated code.",
    highlight: 'Build algorithmic intuition + master AI defect detection.',
    icon: Code2,
    badgeText: 'THE FIELD GUIDE',
    codeSnippet: `// CodeSight Paradigm
function trainEye(developer) {
  const writingSkill = developer.masterComplexity();
  const reviewSkill = developer.catchAIDefects();
  return writingSkill && reviewSkill;
}`,
    diagram: { label: 'SKILL DUALITY', detail: 'Student Track ↔ AI Engineer Track' }
  },
  {
    id: 2,
    eyebrow: 'PLATE 02 / STUDENT TRACK',
    title: 'WRITE',
    subtitle: 'Build algorithmic solutions from scratch.',
    content: 'Solve algorithmic challenges across Python, JavaScript, TypeScript, C++, and Java. Master fundamental data structures, loops, recursion, and object-oriented patterns.',
    highlight: 'Write clean code, run test suites, and pass topic gates.',
    icon: Layers,
    badgeText: 'PHASE 1 FOUNDATION',
    codeSnippet: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target: return mid
        elif arr[mid] < target: low = mid + 1
        else: high = mid - 1
    return -1`,
    diagram: { label: 'ALGORITHMS', detail: 'Binary Search · Dynamic Programming · Trees' }
  },
  {
    id: 3,
    eyebrow: 'PLATE 03 / STUDENT TRACK',
    title: 'OPTIMIZE',
    subtitle: 'Understand Time and Space Complexity.',
    content: 'Never guess performance. Analyze your code against optimal Big-O bounds. CodeSight calculates Time Complexity (TC) and Space Complexity (SC) scores for every submission.',
    highlight: 'Compare O(N log N) vs O(N²) and reach optimal complexity.',
    icon: Cpu,
    badgeText: 'BIG-O ENGINE',
    codeSnippet: `// O(N) Time | O(1) Space
function maxSubArray(nums: number[]): number {
  let maxSum = nums[0], currSum = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currSum = Math.max(nums[i], currSum + nums[i]);
    maxSum = Math.max(maxSum, currSum);
  }
  return maxSum;
}`,
    diagram: { label: 'COMPLEXITY SCORE', detail: 'TC Score: 98% · SC Score: 100%' }
  },
  {
    id: 4,
    eyebrow: 'PLATE 04 / AI ENGINEER TRACK',
    title: 'REVIEW',
    subtitle: 'Inspect AI-generated code with precision.',
    content: 'AI writes fast, but often produces flawed code. Learn to audit code, locate defective lines, classify defect types, and explain underlying failures clearly.',
    highlight: 'Master the 6 Defect Taxonomy classes across real code repositories.',
    icon: Zap,
    badgeText: 'CODE AUDITING',
    codeSnippet: `async function transferFunds(req, res) {
  const { fromAcc, toAcc, amount } = req.body;
  // DEFECT: Missing transaction lock (Concurrency & State)
  const sender = await Account.findById(fromAcc);
  if (sender.balance >= amount) {
    sender.balance -= amount;
    await sender.save(); // Race condition vulnerability!
  }
}`,
    diagram: { label: 'DEFECT TAXONOMY', detail: 'Concurrency · Auth · Input Validation · Logic' }
  },
  {
    id: 5,
    eyebrow: 'PLATE 05 / AI ENGINEER TRACK',
    title: 'SEE',
    subtitle: 'Find what AI security scanners miss.',
    content: 'Automated scanners fail on deep context, subtle state corruption, and boundary edge-cases. Train your review skills to uncover hidden vulnerabilities before production.',
    highlight: 'Line-level precision: select exact line numbers and state reasons.',
    icon: ShieldAlert,
    badgeText: 'LINE LOCALIZATION',
    codeSnippet: `def get_user_data(user_id):
    # DEFECT: Direct SQL string interpolation (SQL Injection)
    query = f"SELECT * FROM users WHERE id = '{user_id}'"
    return db.execute(query)`,
    diagram: { label: 'LOCALIZATION', detail: 'Line 3 flagged · 100% Accuracy' }
  },
  {
    id: 6,
    eyebrow: 'PLATE 06 / ADVANCED WORKSPACE',
    title: 'CODE X-RAY',
    subtitle: 'Diagnostic scanning & hypothesis testing.',
    content: 'Run Code X-Ray to scan codebases like a diagnostic scanner. Select risk hypotheses, execute the scanner, reveal risk maps, and verify ground truth.',
    highlight: 'Interactive risk heatmaps and vulnerable line identification.',
    icon: Sparkles,
    badgeText: 'DIAGNOSTIC SCANNER',
    codeSnippet: `[X-RAY SCAN INITIATED]
--> Risk Hypotheses: [Input Validation, Exception Handling]
--> Scanning AST Nodes...
--> ALERT: Unhandled promise rejection on line 42.`,
    diagram: { label: 'X-RAY RISK MAP', detail: 'High Risk: Line 42 · Medium Risk: Line 88' }
  },
  {
    id: 7,
    eyebrow: 'PLATE 07 / ADVANCED WORKSPACE',
    title: 'FALSE POSITIVE',
    subtitle: 'Know when NOT to report a bug.',
    content: 'Over-reporting creates noise and destroys trust. The False Positive Challenge tests your restraint by presenting clean code alongside buggy code.',
    highlight: 'Submit zero findings when code is clean to earn maximum precision score.',
    icon: ShieldAlert,
    badgeText: 'RESTRAINT & ACCURACY',
    codeSnippet: `// Clean implementation — zero defects
function safeDivide(a: number, b: number): number {
  if (b === 0) throw new Error("Division by zero");
  return a / b;
}`,
    diagram: { label: 'PRECISION METRIC', detail: '0 False Positives · Restraint Score: 100%' }
  },
  {
    id: 8,
    eyebrow: 'PLATE 08 / COMPETITIVE ARENA',
    title: 'AI VS HUMAN',
    subtitle: 'Compare your human review with AI scanners.',
    content: 'Pit your manual review skills directly against LLM auto-scanners. Measure who catches more real defects, who makes fewer false alarms, and who provides clearer explanations.',
    highlight: 'Human intuition vs AI automation head-to-head.',
    icon: Zap,
    badgeText: 'REVIEW ARENA',
    codeSnippet: `VS SCOREBOARD:
Human Reviewer: 3/3 Defects Found | 0 False Alarms
AI Scanner:     2/3 Defects Found | 2 False Alarms
Winner:         HUMAN REVIEWER`,
    diagram: { label: 'MATCH RESULT', detail: 'Human Reviewer Defeats AI Scanner' }
  },
  {
    id: 9,
    eyebrow: 'PLATE 09 / PROGRESSION SYSTEM',
    title: 'PROVE YOUR SKILL',
    subtitle: 'Advance through timed promotion exams & battles.',
    content: 'Earn verified credentials on your Developer Skill Passport. Unlock Beginner, Intermediate, and Pro levels by passing strict timed promotion exams and winning competitive review battles.',
    highlight: 'Verified Skill Cards, leaderboards, and career-building milestones.',
    icon: Award,
    badgeText: 'DEVELOPER PASSPORT',
    codeSnippet: `CREDENTIAL ISSUED:
Level: Pro AI Engineer
Review Score: 2,450 XP
Rank: Top 3% Global`,
    diagram: { label: 'PROMOTION STATUS', detail: 'Pro Level Unlocked · Exam Passed' }
  }
];

export function FieldManualLanding() {
  const [activePlateIndex, setActivePlateIndex] = useState(0);
  const [magnifierActive, setMagnifierActive] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentPlate = PLATES[activePlateIndex];
  const Icon = currentPlate.icon;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const nextPlate = () => {
    setActivePlateIndex((prev) => (prev + 1) % PLATES.length);
  };

  const prevPlate = () => {
    setActivePlateIndex((prev) => (prev - 1 + PLATES.length) % PLATES.length);
  };

  return (
    <section className="relative my-8 mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
      {/* Editorial Field Guide Frame Header */}
      <div className="mb-4 flex flex-col justify-between gap-4 border-b border-[#2E2238] pb-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg border border-[#C96A32]/40 bg-[#C96A32]/10 text-[#C96A32]">
            <BookOpen size={20} />
          </div>
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#C96A32]">
              THE CODESIGHT FIELD MANUAL
            </div>
            <h2 className="font-serif text-xl font-bold text-[#F5EFE6]">The Developer's Interactive Field Guide</h2>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Magnifying Glass Lens Toggle */}
          <button
            onClick={() => setMagnifierActive(!magnifierActive)}
            className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 font-mono text-[11px] font-semibold transition-all ${
              magnifierActive
                ? 'border-[#C96A32] bg-[#C96A32]/20 text-[#F5EFE6] shadow-[0_0_15px_rgba(201,106,50,0.3)]'
                : 'border-[#2E2238] bg-[#17121C] text-[#AAA2B5] hover:border-[#C96A32] hover:text-[#F5EFE6]'
            }`}
          >
            <ZoomIn size={14} className={magnifierActive ? 'text-[#C96A32]' : ''} />
            <span>{magnifierActive ? 'Inspector Active' : 'Inspect Lens'}</span>
          </button>

          {/* Page Counter */}
          <div className="font-mono text-xs font-bold text-[#AAA2B5]">
            PLATE <span className="text-[#C96A32]">{String(currentPlate.id).padStart(2, '0')}</span> / {PLATES.length}
          </div>
        </div>
      </div>

      {/* Chapter Index Quick Jump */}
      <div className="mb-6 flex overflow-x-auto border-b border-[#2E2238] pb-2 no-scrollbar">
        <div className="flex gap-2">
          {PLATES.map((plate, idx) => (
            <button
              key={plate.id}
              onClick={() => setActivePlateIndex(idx)}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 font-mono text-[10px] font-semibold transition-all ${
                activePlateIndex === idx
                  ? 'border border-[#C96A32] bg-[#C96A32]/15 text-[#F5EFE6]'
                  : 'text-[#AAA2B5] hover:bg-[#211827] hover:text-[#F5EFE6]'
              }`}
            >
              0{plate.id}. {plate.title}
            </button>
          ))}
        </div>
      </div>

      {/* Book / Field Manual Tactile Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative min-h-[580px] overflow-hidden rounded-[20px] border border-[#2E2238] bg-[#17121C] p-6 shadow-2xl backdrop-blur-md sm:p-10 lg:p-12"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(35, 25, 45, 0.6), transparent 70%)'
        }}
      >
        {/* Curled Page Edge Texture */}
        <div className="pointer-events-none absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-black/40 to-transparent" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/50 to-transparent" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPlate.id}
            initial={{ opacity: 0, x: 40, rotateY: -5 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: -40, rotateY: 5 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]"
          >
            {/* Left Content Column */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[.18em] text-[#C96A32]">
                    {currentPlate.eyebrow}
                  </span>
                  <span className="rounded border border-[#C96A32]/40 bg-[#C96A32]/15 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-[#C96A32]">
                    {currentPlate.badgeText}
                  </span>
                </div>

                <h2 className="font-serif text-4xl font-bold tracking-tight text-[#F5EFE6] sm:text-5xl lg:text-6xl">
                  {currentPlate.title}
                </h2>
                <h3 className="mt-2 font-sans text-lg font-medium text-[#C9A7FF] sm:text-xl">
                  {currentPlate.subtitle}
                </h3>

                <p className="mt-5 text-sm leading-relaxed text-[#AAA2B5] sm:text-base">
                  {currentPlate.content}
                </p>

                <div className="mt-6 rounded-xl border border-[#C96A32]/30 bg-[#C96A32]/10 p-4 font-mono text-xs font-semibold text-[#F5EFE6]">
                  <span className="text-[#C96A32]">KEY INSIGHT:</span> {currentPlate.highlight}
                </div>
              </div>

              {/* Navigation Arrows */}
              <div className="mt-8 flex items-center justify-between border-t border-[#2E2238] pt-6">
                <button
                  onClick={prevPlate}
                  className="flex items-center gap-2 rounded-lg border border-[#2E2238] bg-[#0B0A0F] px-4 py-2.5 font-mono text-xs font-semibold text-[#AAA2B5] transition-all hover:border-[#C96A32] hover:text-[#F5EFE6]"
                >
                  <ChevronLeft size={16} />
                  <span>Previous Plate</span>
                </button>

                <button
                  onClick={nextPlate}
                  className="flex items-center gap-2 rounded-lg border border-[#C96A32] bg-[#C96A32] px-5 py-2.5 font-mono text-xs font-bold text-[#F5EFE6] shadow-md transition-all hover:bg-[#B55925]"
                >
                  <span>Next Plate</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Right Visual / Code & Diagram Column */}
            <div className="relative flex flex-col justify-center">
              <div className="overflow-hidden rounded-xl border border-[#2E2238] bg-[#0B0A0F] p-5 shadow-xl">
                {/* Visual Header */}
                <div className="mb-4 flex items-center justify-between border-b border-[#2E2238] pb-3">
                  <div className="flex items-center gap-2">
                    <Icon size={18} className="text-[#C96A32]" />
                    <span className="font-mono text-xs font-bold text-[#F5EFE6]">
                      {currentPlate.diagram?.label || 'EVIDENCE FRAME'}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-[#AAA2B5]">
                    {currentPlate.diagram?.detail}
                  </span>
                </div>

                {/* Code Snippet Box */}
                {currentPlate.codeSnippet && (
                  <div className="relative overflow-x-auto rounded-lg border border-[#2E2238] bg-[#17121C] p-4 font-mono text-xs text-[#F5EFE6]">
                    <pre className="leading-relaxed">
                      <code>{currentPlate.codeSnippet}</code>
                    </pre>
                  </div>
                )}

                {/* Diagram Status Box */}
                <div className="mt-4 flex items-center justify-between rounded-lg border border-[#2E2238] bg-[#17121C] p-3 font-mono text-xs text-[#AAA2B5]">
                  <span>Field Inspection Status:</span>
                  <span className="font-bold text-[#4ADE80]">VERIFIED SIGNAL</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Magnifying Glass Inspector Overlay */}
        {magnifierActive && (
          <div
            className="pointer-events-none absolute h-36 w-36 rounded-full border-2 border-[#C96A32] shadow-[0_0_30px_rgba(201,106,50,0.5)] overflow-hidden z-40 bg-[#0B0A0F]/90 backdrop-blur-xl"
            style={{
              left: mousePos.x - 72,
              top: mousePos.y - 72
            }}
          >
            <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center">
              <span className="font-mono text-[9px] font-bold text-[#C96A32]">2.5x INSPECTION</span>
              <span className="mt-1 font-serif text-sm font-bold text-[#F5EFE6]">{currentPlate.title}</span>
              <span className="mt-1 font-mono text-[9px] text-[#AAA2B5]">{currentPlate.badgeText}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
