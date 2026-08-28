import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Clock, CheckCircle2, Send, Lightbulb } from 'lucide-react';
import { MonacoCodeEditor } from '../components/editor/MonacoCodeEditor';
import { getExercise } from '../data/exercises';
import { useApp } from '../context/AppContext';

interface Competitor {
  id: string;
  name: string;
  isYou: boolean;
  status: 'REVIEWING...' | 'LINE MARKED' | 'SUBMITTED';
  avatarLetter: string;
  color: string;
  submitTimeSec?: number;
}

export const BattlePage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useApp();
  const battleExercise = getExercise('jwt-token-verification');

  const [timeLeft, setTimeLeft] = useState<number>(105); // 01:45
  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([
    { id: 'c1', name: `${userProfile.name} (You)`, isYou: true, status: 'REVIEWING...', avatarLetter: 'A', color: 'bg-primary text-on-primary' },
    { id: 'c2', name: 'Sarah', isYou: false, status: 'REVIEWING...', avatarLetter: 'S', color: 'bg-tertiary text-on-tertiary' },
    { id: 'c3', name: 'Dev_Guru', isYou: false, status: 'REVIEWING...', avatarLetter: 'D', color: 'bg-secondary text-on-secondary' },
    { id: 'c4', name: 'ByteMe', isYou: false, status: 'REVIEWING...', avatarLetter: 'B', color: 'bg-primary-container text-white' },
    { id: 'c5', name: 'Elena_K', isYou: false, status: 'REVIEWING...', avatarLetter: 'E', color: 'bg-emerald-600 text-white' }
  ]);

  // Countdown timer & simulated opponent activity
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitVerdict();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simulate competitor state transitions at specific intervals
  useEffect(() => {
    const s1 = setTimeout(() => {
      setCompetitors((prev) =>
        prev.map((c) => (c.id === 'c2' ? { ...c, status: 'LINE MARKED' } : c))
      );
    }, 8000);

    const s2 = setTimeout(() => {
      setCompetitors((prev) =>
        prev.map((c) => (c.id === 'c2' ? { ...c, status: 'SUBMITTED', submitTimeSec: 25 } : c))
      );
    }, 22000);

    const s3 = setTimeout(() => {
      setCompetitors((prev) =>
        prev.map((c) => (c.id === 'c4' ? { ...c, status: 'LINE MARKED' } : c))
      );
    }, 16000);

    const s4 = setTimeout(() => {
      setCompetitors((prev) =>
        prev.map((c) => (c.id === 'c3' ? { ...c, status: 'SUBMITTED', submitTimeSec: 35 } : c))
      );
    }, 35000);

    return () => {
      clearTimeout(s1);
      clearTimeout(s2);
      clearTimeout(s3);
      clearTimeout(s4);
    };
  }, []);

  const handleToggleLine = (lineNumber: number) => {
    setSelectedLines((prev) => {
      const next = prev.includes(lineNumber)
        ? prev.filter((l) => l !== lineNumber)
        : [...prev, lineNumber].sort((a, b) => a - b);
      
      // Update your own status in list
      setCompetitors((current) =>
        current.map((c) =>
          c.isYou
            ? { ...c, status: next.length > 0 ? 'LINE MARKED' : 'REVIEWING...' }
            : c
        )
      );
      return next;
    });
  };

  const handleSubmitVerdict = () => {
    const isCorrect = selectedLines.includes(22);
    const speedBonus = Math.round((timeLeft / 105) * 15);
    const accuracyScore = isCorrect ? 85 : 30;
    const totalScore = accuracyScore + speedBonus;

    // Store battle results in localStorage
    const battleResults = {
      score: totalScore,
      isCorrect,
      selectedLines,
      timeTakenSec: 105 - timeLeft,
      competitorScores: [
        { rank: 1, name: totalScore >= 90 ? `${userProfile.name} (You)` : 'Sarah', score: Math.max(94, totalScore), correct: true, speed: '00:24' },
        { rank: 2, name: totalScore >= 90 ? 'Sarah' : `${userProfile.name} (You)`, score: totalScore >= 90 ? 92 : totalScore, correct: isCorrect, speed: `00:${105 - timeLeft}` },
        { rank: 3, name: 'Dev_Guru', score: 86, correct: true, speed: '00:35' },
        { rank: 4, name: 'ByteMe', score: 71, correct: false, speed: '00:48' },
        { rank: 5, name: 'Elena_K', score: 65, correct: false, speed: '00:54' }
      ].sort((a, b) => b.score - a.score).map((item, idx) => ({ ...item, rank: idx + 1 }))
    };

    try {
      localStorage.setItem('codesight_battle_results', JSON.stringify(battleResults));
    } catch {}

    navigate('/battle/results');
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <main className="w-full max-w-[1400px] mx-auto px-6 md:px-12 py-8 flex flex-col gap-6 relative z-10 animate-fade-in">
      {/* Header Bar */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-outline-variant/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-tertiary/20 text-tertiary border border-tertiary/30 flex items-center justify-center shadow-sm">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-on-surface tracking-tight uppercase">
              Code Review Battle
            </h1>
            <p className="font-mono text-xs text-on-surface-variant tracking-wider">
              ROOM #893A • FIND THE DEFECT FIRST
            </p>
          </div>
        </div>

        {/* Live Timer */}
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-mono text-sm font-bold shadow-sm ${
          timeLeft < 30
            ? 'bg-error/20 text-error border border-error/40 animate-pulse'
            : 'bg-surface-container-highest text-on-surface border border-outline-variant/20'
        }`}>
          <Clock className="w-3.5 h-3.5" />
          <span>{formatTimer(timeLeft)}</span>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[580px]">
        {/* Left Sidebar: Competitors */}
        <aside className="w-full lg:w-[290px] glass-panel rounded-xl p-4 flex flex-col gap-3 shrink-0 shadow-sm">
          <div className="flex justify-between items-center pb-2 border-b border-outline-variant/10">
            <span className="font-mono text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Competitors ({competitors.length}/{competitors.length})
            </span>
          </div>

          <ul className="flex flex-col gap-2">
            {competitors.map((comp) => (
              <li
                key={comp.id}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                  comp.isYou
                    ? 'bg-primary/10 border-primary/40'
                    : 'bg-surface-dim/60 border-outline-variant/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-[11px] font-bold ${comp.color}`}>
                    {comp.avatarLetter}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-sans text-xs font-semibold text-on-surface truncate">
                      {comp.name}
                    </span>
                    <span className={`font-mono text-[10px] font-medium tracking-wider ${
                      comp.status === 'SUBMITTED' ? 'text-emerald-400' : 'text-primary'
                    }`}>
                      {comp.status}
                    </span>
                  </div>
                </div>

                {comp.status === 'SUBMITTED' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
              </li>
            ))}
          </ul>

          <div className="mt-auto p-2.5 rounded bg-surface-container text-[11px] font-mono text-on-surface-variant leading-relaxed border border-outline-variant/10">
            Rule: The highest review quality and line accuracy wins. Raw speed without accuracy is penalized.
          </div>
        </aside>

        {/* Right Editor & Controls */}
        <div className="flex-1 flex flex-col gap-3.5">
          {/* Monaco Editor Container */}
          <div className="flex-1 min-h-[460px] bg-[#0F172A] rounded-xl overflow-hidden shadow-md border border-outline-variant/15 flex flex-col">
            <div className="h-9 bg-[#0B1120] px-4 flex items-center justify-between border-b border-white/5 font-mono text-xs text-on-surface-variant">
              <span>{battleExercise.filename} • {battleExercise.language}</span>
              <span className="text-primary font-semibold">
                {selectedLines.length > 0 ? `Marked Line: ${selectedLines.join(', ')}` : 'Click defect line to mark'}
              </span>
            </div>

            <div className="flex-1 relative overflow-hidden">
              <MonacoCodeEditor
                code={battleExercise.code}
                language={battleExercise.language}
                selectedLines={selectedLines}
                onToggleLine={handleToggleLine}
                readOnly={true}
              />
            </div>
          </div>

          {/* Action Control Bar */}
          <div className="glass-panel p-3.5 rounded-xl flex items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>
                {selectedLines.length > 0
                  ? `Ready to submit line ${selectedLines.join(', ')}`
                  : 'Inspect the code and click the defect line'}
              </span>
            </div>

            <button
              onClick={handleSubmitVerdict}
              disabled={selectedLines.length === 0}
              className={`px-6 py-2.5 rounded-lg font-mono text-xs font-semibold tracking-wider flex items-center gap-2 transition-all shadow-sm ${
                selectedLines.length > 0
                  ? 'bg-primary text-on-primary hover:bg-primary-fixed hover:shadow active:scale-98 cursor-pointer'
                  : 'bg-surface-container-highest text-on-surface-variant/40 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>SUBMIT VERDICT</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};
