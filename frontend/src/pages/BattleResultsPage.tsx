import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Swords, ArrowRight, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';

export const BattleResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useApp();

  // Load results from localStorage or defaults
  const stored = (() => {
    try {
      const raw = localStorage.getItem('codesight_battle_results');
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      score: 94,
      isCorrect: true,
      selectedLines: [22],
      timeTakenSec: 26,
      competitorScores: [
        { rank: 1, name: `${userProfile.name} (You)`, score: 94, correct: true, speed: '00:26' },
        { rank: 2, name: 'Sarah', score: 92, correct: true, speed: '00:31' },
        { rank: 3, name: 'Dev_Guru', score: 86, correct: true, speed: '00:35' },
        { rank: 4, name: 'ByteMe', score: 71, correct: false, speed: '00:48' },
        { rank: 5, name: 'Elena_K', score: 65, correct: false, speed: '00:54' }
      ]
    };
  })();

  const userRank = stored.competitorScores.find((c: any) => c.name.includes('(You)'))?.rank || 1;

  // Trigger very restrained subtle celebration if 1st place
  useEffect(() => {
    if (userRank === 1) {
      try {
        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#adc6ff', '#4d8eff', '#c0c1ff'],
          disableForReducedMotion: true
        });
      } catch {}
    }
  }, [userRank]);

  return (
    <main className="w-full max-w-[960px] mx-auto px-6 py-10 flex flex-col gap-8 relative z-10 animate-fade-in">
      {/* Header Bar */}
      <header className="flex flex-col items-center text-center gap-3">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-tertiary/20 to-primary/20 text-tertiary border border-tertiary/30 flex items-center justify-center shadow-sm">
          <Trophy className="w-7 h-7" />
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-on-surface tracking-tight uppercase">
          Battle Results
        </h1>
        <p className="font-sans text-sm text-on-surface-variant max-w-md">
          Leaderboard ranking based on defect accuracy, precision, and speed under pressure.
        </p>
      </header>

      {/* Podium Cards (Top 3) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
        {/* 2nd Place */}
        {stored.competitorScores[1] && (
          <div className="glass-panel rounded-xl p-5 flex flex-col items-center text-center gap-2.5 order-2 md:order-1 border-outline-variant/15 shadow-sm">
            <span className="font-mono text-xs text-on-surface-variant uppercase font-semibold">2nd Place</span>
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-display text-base font-bold text-on-surface">
              2
            </div>
            <h3 className="font-sans text-sm font-semibold text-on-surface">
              {stored.competitorScores[1].name}
            </h3>
            <span className="font-mono text-lg font-bold text-primary">
              {stored.competitorScores[1].score} pts
            </span>
            <span className="font-mono text-[11px] text-on-surface-variant">
              Time: {stored.competitorScores[1].speed}
            </span>
          </div>
        )}

        {/* 1st Place */}
        {stored.competitorScores[0] && (
          <div className="glass-panel rounded-xl p-6 flex flex-col items-center text-center gap-2.5 order-1 md:order-2 border-primary/40 bg-primary/10 shadow-md relative">
            <div className="absolute -top-2.5 bg-primary text-on-primary font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-sm">
              Winner
            </div>
            <span className="font-mono text-xs text-primary uppercase font-bold">1st Place</span>
            <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-display text-xl font-bold shadow">
              1
            </div>
            <h3 className="font-sans text-base font-bold text-on-surface">
              {stored.competitorScores[0].name}
            </h3>
            <span className="font-mono text-xl font-bold text-primary">
              {stored.competitorScores[0].score} pts
            </span>
            <span className="font-mono text-xs text-on-surface-variant">
              Time: {stored.competitorScores[0].speed}
            </span>
          </div>
        )}

        {/* 3rd Place */}
        {stored.competitorScores[2] && (
          <div className="glass-panel rounded-xl p-5 flex flex-col items-center text-center gap-2.5 order-3 border-outline-variant/15 shadow-sm">
            <span className="font-mono text-xs text-on-surface-variant uppercase font-semibold">3rd Place</span>
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-display text-base font-bold text-on-surface">
              3
            </div>
            <h3 className="font-sans text-sm font-semibold text-on-surface">
              {stored.competitorScores[2].name}
            </h3>
            <span className="font-mono text-lg font-bold text-primary">
              {stored.competitorScores[2].score} pts
            </span>
            <span className="font-mono text-[11px] text-on-surface-variant">
              Time: {stored.competitorScores[2].speed}
            </span>
          </div>
        )}
      </section>

      {/* Leaderboard Table */}
      <section className="glass-panel rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left font-sans text-xs border-collapse">
          <thead>
            <tr className="bg-surface-container-highest/50 font-mono text-[11px] text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/10">
              <th className="py-2.5 px-5 w-16">Rank</th>
              <th className="py-2.5 px-5">Competitor</th>
              <th className="py-2.5 px-5">Accuracy</th>
              <th className="py-2.5 px-5">Speed</th>
              <th className="py-2.5 px-5 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {stored.competitorScores.map((item: any) => (
              <tr
                key={item.rank}
                className={`border-b border-outline-variant/5 transition-colors ${
                  item.name.includes('(You)')
                    ? 'bg-primary/10 font-semibold'
                    : 'hover:bg-surface-container-high/30'
                }`}
              >
                <td className="py-3 px-5 font-mono font-bold">#{item.rank}</td>
                <td className="py-3 px-5 text-on-surface">{item.name}</td>
                <td className="py-3 px-5">
                  {item.correct ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correct Line
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-error font-mono text-[11px]">
                      <XCircle className="w-3.5 h-3.5" /> Missed Vector
                    </span>
                  )}
                </td>
                <td className="py-3 px-5 font-mono text-on-surface-variant">{item.speed}</td>
                <td className="py-3 px-5 text-right font-mono font-bold text-primary">
                  {item.score} pts
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Actions */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-outline-variant/10">
        <button
          onClick={() => navigate('/battle')}
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/40 font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Play Another Battle</span>
        </button>

        <button
          onClick={() => navigate('/practice')}
          className="w-full sm:w-auto px-7 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed hover:-translate-y-0.5 font-mono text-xs font-semibold tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <span>Back to Practice</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </main>
  );
};
