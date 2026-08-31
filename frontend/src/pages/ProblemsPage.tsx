import React, { useState, useMemo } from 'react';
import { Search, Code2, ArrowRight, Circle } from 'lucide-react';
import { useLocation } from 'wouter';
import { phaseOneProblems, PhaseOneProblem } from '@/data/codesight';

interface ProblemsPageProps {
  onSelectProblem: (problem: PhaseOneProblem, mode: 'student' | 'engineer') => void;
  levelTitle?: string;
}

export function ProblemsPage({ onSelectProblem, levelTitle = 'PRO' }: ProblemsPageProps) {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');

  const topics = [
    'All',
    'Injection & Input Validation',
    'Auth & Access Control',
    'Error & Exception Handling',
    'Concurrency & State',
    'Logic & Boundary',
    'Resource & Performance',
  ];

  const difficulties = ['All Difficulties', 'Easy', 'Medium', 'Hard'];

  const filteredProblems = useMemo(() => {
    return phaseOneProblems.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.topic.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDifficulty = selectedDifficulty === 'All Difficulties' || p.difficulty === selectedDifficulty;
      
      const matchesTopic = selectedTopic === 'All' ||
        p.topic === selectedTopic ||
        (selectedTopic === 'Resource & Performance' && (p.topic.toLowerCase().includes('resource') || p.topic.toLowerCase().includes('performance'))) ||
        (selectedTopic === 'Logic & Boundary' && (p.topic.toLowerCase().includes('logic') || p.topic.toLowerCase().includes('boundary') || p.topic === 'Conditions')) ||
        (selectedTopic === 'Injection & Input Validation' && (p.topic.toLowerCase().includes('injection') || p.topic.toLowerCase().includes('validation') || p.topic === 'Variables')) ||
        (selectedTopic === 'Auth & Access Control' && (p.topic.toLowerCase().includes('auth') || p.topic === 'Data Types')) ||
        (selectedTopic === 'Error & Exception Handling' && (p.topic.toLowerCase().includes('error') || p.topic === 'Error Handling')) ||
        (selectedTopic === 'Concurrency & State' && (p.topic.toLowerCase().includes('concurrency') || p.topic.toLowerCase().includes('state') || p.topic === 'Functions' || p.topic === 'Lists'));

      return matchesSearch && matchesDifficulty && matchesTopic;
    });
  }, [searchQuery, selectedDifficulty, selectedTopic]);

  return (
    <div className="space-y-6 pb-12 text-[#17130F] font-mono">
      {/* 1. HEADER BANNER CARD (MATCHES IMAGE BANNER) */}
      <div className="rounded-2xl border border-[#D8D0C0] bg-[#ECE7DA] p-6 shadow-md">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="mono rounded-md border border-[#D8D0C0] bg-[#F7F4EC] px-3 py-1 text-[10px] font-bold tracking-wider text-[#17130F] uppercase">
                STUDENT CODING TRACK
              </span>
              <span className="mono rounded-md border border-[#D8D0C0] bg-[#F7F4EC] px-3 py-1 text-[10px] font-bold tracking-wider text-[#17130F] uppercase">
                LEVEL: {levelTitle}
              </span>
            </div>

            <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-[#17130F] tracking-tight">
              Algorithmic Problem Practice
            </h1>
            <p className="mt-2 text-xs leading-5 text-[#655D54] max-w-2xl">
              Write solutions from scratch. Click <strong className="text-[#17130F]">SOLVE</strong> to open the Monaco workspace and evaluate your Time &amp; Space Complexity.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setLocation('/home')}
              className="rounded-xl border border-[#D8D0C0] bg-[#E2DCCF] px-4 py-2.5 text-xs font-bold text-[#17130F] hover:bg-[#D8D0C0] shadow-sm transition-all"
            >
              Change Level
            </button>
            <button
              onClick={() => {
                if (filteredProblems.length > 0) onSelectProblem(filteredProblems[0], 'student');
              }}
              className="rounded-xl bg-[#17130F] px-4 py-2.5 text-xs font-bold text-[#FFF7ED] hover:bg-[#2C241D] shadow-sm inline-flex items-center gap-1.5 transition-all"
            >
              Next Problem <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. FILTER CONTROLS BAR (DIFFICULTIES & SEARCH) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
        {/* Difficulty Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {difficulties.map((diff) => {
            const isSelected = selectedDifficulty === diff;
            return (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-[#17130F] text-[#FFF7ED] shadow-sm'
                    : 'border border-[#D8D0C0] bg-[#ECE7DA] text-[#17130F] hover:bg-[#D8D0C0]'
                }`}
              >
                {diff}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3.5 top-3 text-[#786F65]" />
          <input
            type="text"
            placeholder="Search problems or topics..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#D8D0C0] bg-[#ECE7DA] py-2 pl-9 pr-3 text-xs text-[#17130F] outline-none focus:border-[#17130F] placeholder:text-[#786F65]"
          />
        </div>
      </div>

      {/* 3. TOPIC FILTER TABS BAR (INCLUDING RESOURCE & PERFORMANCE) */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#D8D0C0] pb-3 pt-1">
        {topics.map((t) => {
          const isSelected = selectedTopic === t;
          return (
            <button
              key={t}
              onClick={() => setSelectedTopic(t)}
              className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-[#17130F] text-[#FFF7ED] shadow-sm'
                  : 'border border-[#D8D0C0] bg-[#ECE7DA] text-[#17130F] hover:bg-[#D8D0C0]'
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* 4. PROBLEMS TABLE */}
      <div className="overflow-hidden rounded-2xl border border-[#D8D0C0] bg-[#ECE7DA] shadow-md">
        <table className="w-full text-left text-xs text-[#17130F]">
          <thead className="border-b border-[#D8D0C0] bg-[#E2DCCF] text-[10px] uppercase text-[#786F65] font-bold">
            <tr>
              <th className="py-3.5 px-6">STATUS</th>
              <th className="py-3.5 px-6">PROBLEM TITLE</th>
              <th className="py-3.5 px-6">DIFFICULTY</th>
              <th className="py-3.5 px-6">TOPIC</th>
              <th className="py-3.5 px-6">OPTIMAL TC / SC</th>
              <th className="py-3.5 px-6 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D8D0C0]">
            {filteredProblems.map((prob) => (
              <tr key={prob.id} className="hover:bg-[#F7F4EC] transition-colors group">
                <td className="py-4 px-6">
                  <Circle size={14} className="text-[#786F65]" />
                </td>
                <td className="py-4 px-6">
                  <div className="font-bold text-sm text-[#17130F]">{prob.title}</div>
                  <div className="text-[11px] text-[#655D54] max-w-lg mt-0.5">{prob.description}</div>
                </td>
                <td className="py-4 px-6">
                  <span className="mono rounded-md border border-[#D8D0C0] bg-[#F7F4EC] px-3 py-1 text-[11px] font-bold text-[#17130F]">
                    {prob.difficulty}
                  </span>
                </td>
                <td className="py-4 px-6 font-semibold text-xs text-[#655D54]">
                  {prob.topic}
                </td>
                <td className="py-4 px-6 font-mono text-xs font-bold text-[#17130F]">
                  {prob.topic.includes('Resource') || prob.topic.includes('Performance') ? 'O(N) / O(1)' : 'O(N) / O(N)'}
                </td>
                <td className="py-4 px-6 text-right">
                  <button
                    onClick={() => onSelectProblem(prob, 'student')}
                    className="rounded-xl bg-[#17130F] px-5 py-2 text-xs font-bold text-[#FFF7ED] hover:bg-[#2C241D] shadow-sm transition-all"
                  >
                    SOLVE
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProblems.length === 0 && (
          <div className="p-8 text-center text-[#786F65] font-semibold">
            No problems match your search criteria. Try selecting another topic or difficulty.
          </div>
        )}
      </div>
    </div>
  );
}
