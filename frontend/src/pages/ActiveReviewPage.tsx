import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lightbulb, Send, AlertCircle, ShieldCheck, Clock, FileCode, CheckCircle2 } from 'lucide-react';
import { MonacoCodeEditor } from '../components/editor/MonacoCodeEditor';
import { getExercise, Exercise } from '../data/exercises';
import { getDefectClass } from '../data/defectClasses';
import { useApp } from '../context/AppContext';

export const ActiveReviewPage: React.FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const { submitReview } = useApp();

  const exercise = getExercise(exerciseId || 'unchecked-return-values');
  const defectClass = getDefectClass(exercise.defectClassId);

  // Local interaction state
  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  const [explanation, setExplanation] = useState<string>('');
  const [hintsUnlocked, setHintsUnlocked] = useState<number>(0);
  const [showHintModal, setShowHintModal] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [pastedDetected, setPastedDetected] = useState<boolean>(false);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format timer MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleToggleLine = (lineNum: number) => {
    setSelectedLines((prev) => {
      if (prev.includes(lineNum)) {
        return prev.filter((l) => l !== lineNum);
      } else {
        return [...prev, lineNum].sort((a, b) => a - b);
      }
    });
  };

  const handleUnlockNextHint = () => {
    if (hintsUnlocked < exercise.hints.length) {
      setHintsUnlocked((prev) => prev + 1);
    }
  };

  const isFormValid = (selectedLines.length > 0 || exercise.isCleanCodeTrap) && explanation.trim().length >= 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    // Trigger local grading & save result
    submitReview(exercise.id, selectedLines, explanation, hintsUnlocked);

    // Navigate to analyzing sequence
    navigate(`/review/${exercise.id}/analyzing`);
  };

  const currentHintMultiplier = hintsUnlocked === 0 ? 100 : hintsUnlocked === 1 ? 90 : hintsUnlocked === 2 ? 75 : 50;

  return (
    <div className="w-full h-[calc(100vh-64px)] flex flex-col md:flex-row overflow-hidden relative z-10 animate-fade-in">
      {/* Left Sidebar / Context & Review Panel */}
      <aside className="w-full md:w-[380px] lg:w-[410px] flex flex-col glass-nav border-r border-outline-variant/10 h-full overflow-y-auto shrink-0 z-20 custom-scrollbar">
        {/* Header Metadata */}
        <div className="p-6 border-b border-outline-variant/10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-primary-container/20 text-primary border border-primary/30 font-mono text-[11px] font-semibold rounded">
                {defectClass.shortName}
              </span>
              <span className="px-2 py-0.5 bg-surface-container-highest text-on-surface-variant font-mono text-[11px] rounded">
                {exercise.difficulty}
              </span>
            </div>
            <div className="flex items-center gap-1 font-mono text-xs text-on-surface-variant">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>
          </div>

          <h1 className="font-display text-xl font-semibold text-on-surface tracking-tight">
            {exercise.title}
          </h1>
          <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            {exercise.description}
          </p>
        </div>

        {/* Review Instructions & Selection Area */}
        <div className="p-6 flex-1 flex flex-col gap-5">
          {/* Prompt card */}
          <div className="bg-surface-container/60 rounded-lg p-3.5 border border-outline-variant/10 flex flex-col gap-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <h2 className="font-sans text-xs font-semibold text-on-surface">
              Find the defect. Explain the risk.
            </h2>
            <p className="font-sans text-xs text-on-surface-variant">
              Click suspicious lines in the editor below to mark your findings.
            </p>
          </div>

          {/* Selection Status */}
          <div className={`p-3.5 rounded-lg transition-all duration-200 border ${
            selectedLines.length > 0
              ? 'bg-surface-container-high/60 border-primary/30 shadow-sm'
              : 'bg-surface-container/30 border-outline-variant/10 opacity-70'
          }`}>
            <div className="flex justify-between items-center mb-1">
              <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">
                Marked Line(s)
              </span>
              <span className="font-mono text-xs font-semibold text-primary">
                {selectedLines.length > 0 ? selectedLines.join(', ') : 'None selected'}
              </span>
            </div>

            {selectedLines.length === 0 && (
              <p className="font-mono text-[11px] text-on-surface-variant/70 italic">
                Click any line in the code editor to unlock the explanation field.
              </p>
            )}

            {/* Clean Code Action if student suspects no defect */}
            {exercise.isCleanCodeTrap && (
              <button
                type="button"
                onClick={() => setSelectedLines([])}
                className="mt-2 text-[11px] font-mono text-secondary hover:underline flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3" />
                This code is clean (0 defects)
              </button>
            )}
          </div>

          {/* Explanation Textarea Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs text-on-surface-variant flex justify-between items-center">
                <span>What breaks, and why?</span>
                <span className={`text-[11px] ${explanation.length > 250 ? 'text-tertiary' : 'text-on-surface-variant/60'}`}>
                  {explanation.length}/280
                </span>
              </label>
              <textarea
                disabled={selectedLines.length === 0 && !exercise.isCleanCodeTrap}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value.slice(0, 280))}
                onPaste={() => setPastedDetected(true)}
                rows={4}
                placeholder={
                  selectedLines.length > 0
                    ? exercise.explanationPrompt
                    : "Select a suspicious line first to explain the risk..."
                }
                className={`w-full p-3 rounded-lg font-sans text-xs sm:text-sm bg-surface-dim/80 text-on-surface border transition-all resize-none focus:outline-none ${
                  selectedLines.length > 0 || exercise.isCleanCodeTrap
                    ? 'border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary/40 placeholder:text-on-surface-variant/50'
                    : 'border-outline-variant/10 opacity-50 cursor-not-allowed placeholder:text-on-surface-variant/30'
                }`}
              />
              {pastedDetected && (
                <span className="font-mono text-[10px] text-tertiary">
                  Note: Write your explanation concisely in your own words.
                </span>
              )}
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full py-2.5 px-4 rounded-lg font-mono text-xs font-semibold tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm ${
                isFormValid
                  ? 'bg-primary text-on-primary hover:bg-primary-fixed hover:shadow active:scale-98 cursor-pointer'
                  : 'bg-surface-container-highest text-on-surface-variant/40 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Review</span>
            </button>
          </form>

          {/* Progressive Hint Drawer / Accordion */}
          <div className="mt-auto pt-3 border-t border-outline-variant/10">
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => setShowHintModal(!showHintModal)}
                className="font-mono text-xs text-primary hover:underline flex items-center gap-1.5"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>{hintsUnlocked === 0 ? "Need a hint?" : `Hints (${hintsUnlocked}/${exercise.hints.length})`}</span>
              </button>

              <span className="font-mono text-[11px] text-on-surface-variant">
                Score: <strong className="text-primary">{currentHintMultiplier}%</strong>
              </span>
            </div>

            {/* Hint details */}
            {showHintModal && (
              <div className="flex flex-col gap-2 p-3 bg-surface-container rounded-lg border border-outline-variant/15 animate-fade-in text-xs font-sans">
                {exercise.hints.slice(0, hintsUnlocked).map((h) => (
                  <div key={h.id} className="p-2 rounded bg-surface-dim border-l-2 border-primary">
                    <span className="font-mono text-[10px] text-primary font-semibold block mb-0.5">
                      Hint {h.id}: {h.level}
                    </span>
                    <p className="text-on-surface-variant text-[11px] leading-relaxed">
                      {h.text}
                    </p>
                  </div>
                ))}

                {hintsUnlocked < exercise.hints.length && (
                  <button
                    type="button"
                    onClick={handleUnlockNextHint}
                    className="mt-1 py-1.5 px-3 rounded bg-surface-container-highest hover:bg-primary/20 text-on-surface font-mono text-[11px] transition-colors text-center"
                  >
                    Unlock Hint {hintsUnlocked + 1} (Decays score to {hintsUnlocked === 0 ? '90%' : hintsUnlocked === 1 ? '75%' : '50%'})
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Monaco Editor Workspace */}
      <main className="flex-1 flex flex-col bg-[#0F172A] relative h-full overflow-hidden">
        {/* Editor File Tab Header */}
        <div className="h-10 bg-[#0B1120] border-b border-white/5 px-4 flex items-center justify-between text-xs font-mono text-on-surface-variant select-none">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] text-on-surface border-t-2 border-primary">
              <FileCode className="w-3.5 h-3.5 text-primary" />
              <span>{exercise.filename}</span>
            </div>
          </div>
          <span className="text-[11px] text-on-surface-variant/60 hidden sm:inline">
            Read-only • Click lines to mark defects
          </span>
        </div>

        {/* Monaco Editor Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <MonacoCodeEditor
            code={exercise.code}
            language={exercise.language}
            selectedLines={selectedLines}
            onToggleLine={handleToggleLine}
            readOnly={true}
          />
        </div>
      </main>
    </div>
  );
};
