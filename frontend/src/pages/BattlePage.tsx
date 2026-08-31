import React, { useState, useEffect } from 'react';
import { Swords, Users, Shield, Trophy, Clock3, Send } from 'lucide-react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { useAuth } from '@/contexts/AuthContext';
import { phaseOneProblems } from '@/data/codesight';
import { toast } from 'sonner';

type BattleState = 'lobby' | 'matchmaking' | 'in_match' | 'match_ended';

interface PlayerScore {
  name: string;
  rank: number;
  score: number;
  solved: boolean;
  timeSecs: number;
}

export function BattlePage() {
  const { user, addSubmission } = useAuth();
  const [state, setState] = useState<BattleState>('lobby');
  const [matchType, setMatchType] = useState<'friend' | 'random'>('random');
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  
  // Timer setup: 3 minutes (180s)
  const [timeLeft, setTimeLeft] = useState(180);
  const [code, setCode] = useState(phaseOneProblems[0].starterCode);

  const [leaderboard, setLeaderboard] = useState<PlayerScore[]>([
    { name: user.name, rank: 1, score: 0, solved: false, timeSecs: 0 },
    { name: 'Mina Park', rank: 2, score: 85, solved: true, timeSecs: 110 },
    { name: 'Tobias Reed', rank: 3, score: 70, solved: true, timeSecs: 140 },
  ]);

  const problem = phaseOneProblems[0];

  useEffect(() => {
    if (state !== 'in_match') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishMatch();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [state]);

  const startCreateRoom = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setRoomCode(`CS-${code}`);
    setMatchType('friend');
    setState('in_match');
    toast.success(`Room created! Share Code: CS-${code}`);
  };

  const startJoinRoom = () => {
    if (!inputCode.trim()) {
      toast.error('Please enter a valid room code.');
      return;
    }
    setRoomCode(inputCode.toUpperCase());
    setMatchType('friend');
    setState('in_match');
    toast.success(`Joined Room ${inputCode.toUpperCase()}`);
  };

  const startRandomMatch = () => {
    setMatchType('random');
    setState('matchmaking');
    toast('Searching for opponents in Ranked 4-Player Matchmaking...');

    setTimeout(() => {
      setState('in_match');
      toast.success('Opponents found! Battle Started.');
    }, 1500);
  };

  const handleSubmitBattle = () => {
    const isPass = code.length > 40;
    const speedBonus = 20; // 1st place speed bonus
    const complexityScore = isPass ? 60 : 0;
    const totalScore = complexityScore + speedBonus;

    setLeaderboard(prev => [
      { name: user.name, rank: 1, score: totalScore, solved: isPass, timeSecs: 180 - timeLeft },
      ...prev.slice(1)
    ]);

    if (matchType === 'random') {
      addSubmission({
        problemId: problem.id,
        title: problem.title,
        score: totalScore,
        mode: 'student',
        userTimeComplexity: 'O(N)',
        userSpaceComplexity: 'O(1)',
        optimalTimeComplexity: 'O(N)',
        optimalSpaceComplexity: 'O(1)',
        feedback: `Ranked Match Completed! 1st Place (+20 Speed Bonus applied).`,
        defectClass: 'Infinite Loops'
      });
    }

    handleFinishMatch();
  };

  const handleFinishMatch = () => {
    setState('match_ended');
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (state === 'lobby') {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-6 text-[#17130F] font-mono">
        <div className="text-center max-w-xl mx-auto border-b border-[#D8D0C0] pb-6">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#746D61]">
            MULTIPLAYER ARENA
          </div>
          <h1 className="font-serif text-3xl font-extrabold text-[#17130F] sm:text-4xl mt-1">
            CODE REVIEW BATTLE ARENA
          </h1>
          <p className="mt-2 text-xs text-[#403A32]">
            Compete against engineering peers in real-time complexity optimization and defect localization.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {/* Create Room */}
          <div className="rounded-xl border border-[#D8D0C0] bg-[#F5F1E7] p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="h-10 w-10 rounded-lg bg-[#EDE7D7] text-[#17130F] flex items-center justify-center mb-3">
                <Users size={20} />
              </div>
              <h2 className="font-serif text-xl font-bold text-[#17130F]">Friend Match</h2>
              <p className="text-xs text-[#746D61] mt-1">Host a private custom room with 1–3 problems for friends.</p>
            </div>
            <button
              onClick={startCreateRoom}
              className="w-full py-2.5 rounded-lg text-xs font-bold border border-[#17130F] bg-[#F8F5EC] text-[#17130F] hover:bg-[#EDE7D7]"
            >
              Create Private Room
            </button>
          </div>

          {/* Join Room */}
          <div className="rounded-xl border border-[#D8D0C0] bg-[#F5F1E7] p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="h-10 w-10 rounded-lg bg-[#EDE7D7] text-[#17130F] flex items-center justify-center mb-3">
                <Shield size={20} />
              </div>
              <h2 className="font-serif text-xl font-bold text-[#17130F]">Custom Room Code</h2>
              <p className="text-xs text-[#746D61] mt-1">Enter a 6-digit room code from a friend.</p>
              <input
                type="text"
                placeholder="e.g. CS-9821"
                value={inputCode}
                onChange={e => setInputCode(e.target.value)}
                className="mt-3 w-full rounded-lg border border-[#D8D0C0] bg-[#F8F5EC] px-3 py-2 text-xs uppercase font-mono text-[#17130F] outline-none"
              />
            </div>
            <button
              onClick={startJoinRoom}
              className="w-full py-2.5 rounded-lg text-xs font-bold border border-[#17130F] bg-[#17130F] text-[#F8F5EC] hover:bg-[#403A32]"
            >
              Join Room
            </button>
          </div>

          {/* Random Ranked Match */}
          <div className="rounded-xl border border-[#17130F] bg-[#F5F1E7] p-6 shadow-md flex flex-col justify-between space-y-4">
            <div>
              <div className="h-10 w-10 rounded-lg bg-[#17130F] text-[#F8F5EC] flex items-center justify-center mb-3">
                <Swords size={20} />
              </div>
              <h2 className="font-serif text-xl font-bold text-[#17130F]">Ranked 4-Player Match</h2>
              <p className="text-xs text-[#403A32] mt-1">1 Problem · 03:00 Mins · +20 Pts Speed Bonus.</p>
              <div className="mt-2 text-[10px] text-[#17130F] font-bold">Competitive: Updates Global Rank &amp; XP!</div>
            </div>
            <button
              onClick={startRandomMatch}
              className="w-full py-2.5 rounded-lg text-xs font-bold border border-[#17130F] bg-[#17130F] text-[#F8F5EC] hover:bg-[#403A32] shadow-sm"
            >
              Find Ranked Opponents
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'matchmaking') {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6 text-[#17130F] font-mono">
        <div className="h-16 w-16 rounded-full bg-[#17130F] text-[#F8F5EC] flex items-center justify-center mx-auto animate-pulse">
          <Swords size={32} />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#17130F]">Searching for Ranked Opponents...</h2>
        <p className="text-xs text-[#746D61]">Matching 4 players for 03:00 Min Speed Challenge (+20 Speed Bonus)...</p>
      </div>
    );
  }

  if (state === 'match_ended') {
    return (
      <div className="max-w-xl mx-auto py-12 space-y-6 text-center font-mono text-[#17130F]">
        <div className="h-16 w-16 rounded-full bg-[#EDE7D7] border border-[#17130F] text-[#17130F] flex items-center justify-center mx-auto shadow-sm">
          <Trophy size={36} />
        </div>
        <h2 className="font-serif text-3xl font-bold text-[#17130F]">BATTLE COMPLETED!</h2>
        <p className="text-xs text-[#746D61]">
          {matchType === 'random' 
            ? 'Ranked Match Results — Global Rank & XP updated!' 
            : 'Custom Room Results — Practice match completed.'}
        </p>

        {/* Final Standings */}
        <div className="rounded-xl border border-[#D8D0C0] bg-[#F5F1E7] p-5 text-left shadow-sm space-y-2 text-xs">
          <div className="font-bold text-[#746D61] border-b border-[#D8D0C0] pb-2">FINAL STANDINGS</div>
          {leaderboard.map(p => (
            <div key={p.name} className="flex items-center justify-between py-2 border-b border-[#D8D0C0] last:border-0">
              <span className="font-bold flex items-center gap-2 text-[#17130F]">
                <span className="w-5 h-5 rounded-full bg-[#17130F] text-[#F8F5EC] grid place-items-center text-[10px]">{p.rank}</span>
                {p.name}
              </span>
              <span className="font-bold text-[#17130F]">{p.score} pts</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setState('lobby')}
          className="rounded-lg border border-[#17130F] bg-[#17130F] px-8 py-3 text-xs font-bold text-[#F8F5EC] hover:bg-[#403A32]"
        >
          Return to Battle Lobby
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] overflow-hidden rounded-xl border border-[#D8D0C0] bg-[#F5F1E7] shadow-sm text-[#17130F] font-mono">
      {/* Battle Top Bar */}
      <div className="flex items-center justify-between border-b border-[#D8D0C0] bg-[#F2EEE3] px-4 py-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[#17130F]">
            {matchType === 'random' ? 'RANKED 4-PLAYER MATCH (+20 SPEED BONUS)' : `ROOM: ${roomCode}`}
          </span>
          <span className="h-4 w-px bg-[#D8D0C0]" />
          <span className="font-bold text-[#403A32]">{problem.title}</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#17130F] bg-[#EDE7D7] px-3 py-1 rounded border border-[#D8D0C0]">
            <Clock3 size={15} /> {formatTime(timeLeft)}
          </div>

          <button
            onClick={handleSubmitBattle}
            className="flex items-center gap-1.5 rounded-lg border border-[#17130F] bg-[#17130F] px-4 py-1.5 text-[11px] font-bold text-[#F8F5EC] hover:bg-[#403A32]"
          >
            <Send size={12} /> Submit Fix
          </button>
        </div>
      </div>

      {/* Battle Resizable Layout */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Panel 1: Problem & Live Leaderboard */}
          <Panel defaultSize={30} minSize={20}>
            <div className="h-full overflow-y-auto p-5 border-r border-[#D8D0C0] bg-[#F5F1E7] space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#746D61]">BATTLE PROBLEM</span>
                <h2 className="font-serif text-xl font-bold mt-1 text-[#17130F]">{problem.title}</h2>
              </div>
              <p className="text-xs leading-5 text-[#403A32]">{problem.prompt}</p>

              {/* Live Leaderboard */}
              <div className="rounded-lg border border-[#D8D0C0] bg-[#F8F5EC] p-3 space-y-2 text-xs">
                <div className="font-bold text-[#746D61]">LIVE MATCH LEADERBOARD</div>
                {leaderboard.map(p => (
                  <div key={p.name} className="flex items-center justify-between py-1 border-b border-[#D8D0C0] last:border-0">
                    <span className="text-[#17130F]">{p.rank}. {p.name}</span>
                    <span className="font-bold text-[#17130F]">{p.score} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-1.5 bg-[#D8D0C0] hover:bg-[#17130F] transition-colors cursor-col-resize" />

          {/* Panel 2: Code Editor */}
          <Panel defaultSize={70} minSize={40}>
            <div className="flex flex-col h-full bg-[#F8F5EC] text-[#17130F]">
              <div className="border-b border-[#D8D0C0] bg-[#F2EEE3] px-4 py-2 text-xs font-bold text-[#17130F]">
                battle_solution.py
              </div>
              <div className="flex-1 p-4 font-mono text-xs leading-6 overflow-y-auto">
                <textarea
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  spellCheck={false}
                  className="w-full h-full bg-transparent text-[#17130F] outline-none font-mono resize-none"
                />
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
