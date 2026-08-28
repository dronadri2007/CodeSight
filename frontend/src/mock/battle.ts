import type { BattleRoom, LeaderboardEntry } from '../types'

export const mockBattleRoom: BattleRoom = {
  id: '4821',
  code: '',
  phase: 'lobby',
  timeRemaining: 180,
  exerciseId: 'ex-08',
  players: [
    { id: 'p1', name: 'Afrid', avatar: 'AF', submitted: false },
    { id: 'p2', name: 'Rahul', avatar: 'RK', submitted: false },
    { id: 'p3', name: 'Karthik', avatar: 'KM', submitted: false },
    { id: 'p4', name: 'Suman', avatar: 'SP', submitted: false },
  ],
}

export const mockBattleResults: LeaderboardEntry[] = [
  {
    rank: 1,
    player: { id: 'p1', name: 'Afrid', avatar: 'AF', submitted: true },
    score: 842,
    breakdown: { correctFindings: 560, explanation: 220, falsePenalty: 0, timebonus: 62, total: 842 },
    badge: 'Most Precise',
  },
  {
    rank: 2,
    player: { id: 'p2', name: 'Rahul', avatar: 'RK', submitted: true },
    score: 799,
    breakdown: { correctFindings: 560, explanation: 180, falsePenalty: -40, timebonus: 99, total: 799 },
  },
  {
    rank: 3,
    player: { id: 'p3', name: 'Karthik', avatar: 'KM', submitted: true },
    score: 741,
    breakdown: { correctFindings: 420, explanation: 260, falsePenalty: 0, timebonus: 61, total: 741 },
    badge: 'Best Explanation',
  },
  {
    rank: 4,
    player: { id: 'p4', name: 'Suman', avatar: 'SP', submitted: true },
    score: 612,
    breakdown: { correctFindings: 420, explanation: 140, falsePenalty: -80, timebonus: 132, total: 612 },
  },
]

export const mockAIComparison = {
  exerciseId: 'ex-08',
  human: {
    name: 'Afrid',
    found: ['Timing-unsafe password comparison (line 15)', 'Weak hashing algorithm (SHA-256 without salt)'],
    correct: 1,
    uniqueFind: 'Weak hashing algorithm (SHA-256 without salt)',
  },
  ai: {
    name: 'AI Reviewer',
    found: [
      'Timing-unsafe password comparison (line 15)',
      'Hardcoded secret key (line 5)',
      'No rate limiting on login endpoint',
      'Missing CSRF protection',
    ],
    correct: 4,
  },
  agreed: ['Timing-unsafe password comparison (line 15)'],
  humanOnly: ['Weak hashing algorithm (SHA-256 without salt)'],
  aiOnly: ['Hardcoded secret key', 'No rate limiting', 'Missing CSRF protection'],
}
