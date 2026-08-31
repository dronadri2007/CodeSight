import React, { useState } from 'react';
import { BookOpen, Youtube, Play, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { DefectClass } from '@/contexts/AuthContext';

interface ConceptLearnPageProps {
  initialDefect?: string;
}

interface DefectConcept {
  id: DefectClass;
  title: string;
  explanation: string;
  badCode: string;
  fixedCode: string;
  patternToWatch: string;
  howToAvoid: string;
  youtubeVideos: Array<{ title: string; channel: string; duration: string; url: string }>;
}

const DEFECT_CONCEPTS: Record<DefectClass, DefectConcept> = {
  'Infinite Loops': {
    id: 'Infinite Loops',
    title: 'Infinite Loops & Boundary Oversights',
    explanation: 'Occurs when a loop control variable is never updated or skips its termination condition, causing quadratic performance or runtime hangs.',
    badCode: `for index in range(len(readings) - 1):\n    total += readings[index] # Skips final element!`,
    fixedCode: `for index in range(len(readings)):\n    total += readings[index] # Covers entire range safely`,
    patternToWatch: 'Watch out for range(len(x) - 1) or loop conditions that depend on external mutations.',
    howToAvoid: 'Use pythonic iterators (for x in collection) rather than index manipulation whenever possible.',
    youtubeVideos: [
      { title: 'Python Off-By-One Errors & Loop Boundaries', channel: 'Corey Schafer', duration: '12:45', url: 'https://www.youtube.com/watch?v=rfscVS0vtbw' },
      { title: 'Understanding Algorithmic Complexity O(N)', channel: 'CS Dojo', duration: '15:20', url: 'https://www.youtube.com/watch?v=g2o22C3CRfU' }
    ]
  },
  'Unchecked Returns': {
    id: 'Unchecked Returns',
    title: 'Unchecked Returns & Null Pointer Crashes',
    explanation: 'Calling methods or properties on return values without verifying if the operation succeeded or returned null/undefined.',
    badCode: `val = get_user(id)\nreturn val.name # Crashes if user is None!`,
    fixedCode: `val = get_user(id)\nif not val: return "Guest"\nreturn val.name`,
    patternToWatch: 'Chained property access like obj.prop.subprop without optional chaining or null checks.',
    howToAvoid: 'Implement guard clauses early in function bodies.',
    youtubeVideos: [
      { title: 'Handling Null & Optional Chaining Safely', channel: 'Fireship', duration: '08:10', url: 'https://www.youtube.com/watch?v=v2tJ3nzXh8I' }
    ]
  },
  'SQL Injection': {
    id: 'SQL Injection',
    title: 'SQL Injection & Unsanitized Input',
    explanation: 'Directly concatenating untrusted user input into database query strings.',
    badCode: `query = "SELECT * FROM users WHERE name = '" + input + "'"` ,
    fixedCode: `query = "SELECT * FROM users WHERE name = %s"\ncursor.execute(query, (input,))`,
    patternToWatch: 'String formatting or concatenation inside database query calls.',
    howToAvoid: 'Always use parameterized queries or ORM prepared statements.',
    youtubeVideos: [
      { title: 'SQL Injection Explained in 100 Seconds', channel: 'Fireship', duration: '02:30', url: 'https://www.youtube.com/watch?v=ciNHn38EyRc' }
    ]
  },
  'Race Conditions': {
    id: 'Race Conditions',
    title: 'Race Conditions & Concurrency Hazards',
    explanation: 'Multiple asynchronous tasks mutating shared state simultaneously without mutex locks.',
    badCode: `balance += deposit # Non-atomic read-modify-write!`,
    fixedCode: `with lock:\n    balance += deposit # Mutex lock guarantees atomicity`,
    patternToWatch: 'Global variables mutated across async handlers or threads.',
    howToAvoid: 'Use thread-safe data structures and locks.',
    youtubeVideos: [
      { title: 'Race Conditions & Thread Synchronization', channel: 'Computerphile', duration: '11:15', url: 'https://www.youtube.com/watch?v=9_N67lQ3vP0' }
    ]
  },
  'Resource Leaks': {
    id: 'Resource Leaks',
    title: 'Resource Leaks & Unclosed Handles',
    explanation: 'Opening file, network, or database handles without ensuring cleanup on error.',
    badCode: `f = open('data.txt')\ndata = f.read()\nreturn data # File handle remains open!`,
    fixedCode: `with open('data.txt') as f:\n    return f.read() # Auto-closed via context manager`,
    patternToWatch: 'File or socket objects opened outside try/finally or context managers.',
    howToAvoid: 'Use context managers (with statements in Python, try-with-resources in Java).',
    youtubeVideos: [
      { title: 'Python Context Managers & Resource Safety', channel: 'mcode', duration: '09:40', url: 'https://www.youtube.com/watch?v=-aKFBoZgSZg' }
    ]
  },
  'Type Mismatches': {
    id: 'Type Mismatches',
    title: 'Type Mismatches & Implicit Coercions',
    explanation: 'Performing arithmetic or comparison operations on incompatible data types.',
    badCode: `res = "Score: " + 42 # TypeError in Python!`,
    fixedCode: `res = f"Score: {42}" # Explicit string formatting`,
    patternToWatch: 'Mixing string inputs from web requests directly into arithmetic expressions.',
    howToAvoid: 'Use type hints and explicit type casting functions.',
    youtubeVideos: [
      { title: 'Python Type Hinting & Type Checking', channel: 'ArjanCodes', duration: '14:05', url: 'https://www.youtube.com/watch?v=QORvB-_mbZ0' }
    ]
  }
};

export function ConceptLearnPage({ initialDefect }: ConceptLearnPageProps) {
  const [selectedDefect, setSelectedDefect] = useState<DefectClass>(
    (initialDefect as DefectClass) || 'Infinite Loops'
  );

  const concept = DEFECT_CONCEPTS[selectedDefect] || DEFECT_CONCEPTS['Infinite Loops'];

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4 animate-rise">
      {/* Header */}
      <div className="border-b border-[#2E2238] pb-5">
        <div className="diag-rail mb-1">
          <span className="mono text-[9px] text-[#AAA2B5]">EDUCATIONAL KNOWLEDGE BASE</span>
          <span className="eyebrow text-[#C96A32]">CONCEPT MASTERY</span>
        </div>
        <h1 className="display text-3xl font-bold text-[#F5EFE6]">Defect Class Deep Dives</h1>
        <p className="mt-1 text-xs text-[#AAA2B5]">Understand the underlying mechanics of software bugs and how to prevent them in production.</p>
      </div>

      {/* Concept Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(DEFECT_CONCEPTS) as DefectClass[]).map(defect => (
          <button
            key={defect}
            onClick={() => setSelectedDefect(defect)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
              selectedDefect === defect
                ? 'bg-[#C96A32] text-white border-[#C96A32] shadow-md'
                : 'bg-[#17121C] text-[#AAA2B5] border-[#2E2238] hover:border-[#C96A32]/50 hover:text-[#F5EFE6]'
            }`}
          >
            {defect}
          </button>
        ))}
      </div>

      {/* Main Concept Card */}
      <div className="rounded-xl border border-[#2E2238] bg-[#17121C] p-6 shadow-sm space-y-6">
        <div>
          <span className="eyebrow text-[#C96A32]">{concept.id}</span>
          <h2 className="display text-2xl font-bold mt-1 text-[#F5EFE6]">{concept.title}</h2>
          <p className="mt-2 text-xs text-[#AAA2B5] leading-6">{concept.explanation}</p>
        </div>

        {/* Code Comparison */}
        <div className="grid md:grid-cols-2 gap-4 text-xs font-mono">
          {/* Vulnerable / Bad Code */}
          <div className="rounded-lg border border-[#EF4444]/40 bg-[#EF4444]/10 p-4 space-y-2">
            <div className="font-bold text-[#FCA5A5] flex items-center gap-1.5">
              <ShieldAlert size={14} /> Vulnerable / Incorrect Pattern
            </div>
            <pre className="p-3 bg-[#0B0A0F] text-[#F5EFE6] rounded-md overflow-x-auto text-[11px]">
              {concept.badCode}
            </pre>
          </div>

          {/* Corrected / Optimal Code */}
          <div className="rounded-lg border border-[#22C55E]/40 bg-[#22C55E]/10 p-4 space-y-2">
            <div className="font-bold text-[#4ADE80] flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Corrected / Optimal Pattern
            </div>
            <pre className="p-3 bg-[#0B0A0F] text-[#F5EFE6] rounded-md overflow-x-auto text-[11px]">
              {concept.fixedCode}
            </pre>
          </div>
        </div>

        {/* Patterns & Avoidance */}
        <div className="grid md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-lg border border-[#2E2238] bg-[#0B0A0F] p-4">
            <div className="mono font-bold text-[#C96A32] mb-1">PATTERN TO WATCH FOR</div>
            <p className="text-[#AAA2B5] leading-5">{concept.patternToWatch}</p>
          </div>
          <div className="rounded-lg border border-[#2E2238] bg-[#0B0A0F] p-4">
            <div className="mono font-bold text-[#C96A32] mb-1">BEST PRACTICE PREVENTION</div>
            <p className="text-[#AAA2B5] leading-5">{concept.howToAvoid}</p>
          </div>
        </div>
      </div>

      {/* Educational YouTube Video Resources */}
      <div className="rounded-xl border border-[#2E2238] bg-[#17121C] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Youtube size={20} className="text-[#EF4444]" />
          <h3 className="display text-lg font-bold text-[#F5EFE6]">Curated YouTube Educational Resources</h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {concept.youtubeVideos.map(video => (
            <a
              key={video.url}
              href={video.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-[#2E2238] bg-[#0B0A0F] p-4 hover:border-[#C96A32]/50 transition-all flex justify-between items-start group"
            >
              <div>
                <div className="text-xs font-bold text-[#F5EFE6] group-hover:text-[#C96A32] transition-colors">{video.title}</div>
                <div className="text-[11px] text-[#AAA2B5] mt-1">{video.channel} · {video.duration}</div>
              </div>
              <Play size={16} className="text-[#C96A32] shrink-0 mt-0.5" fill="currentColor" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
