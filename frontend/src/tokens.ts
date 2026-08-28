// CodeSight Design Tokens
// Single source of truth - also consumed by tailwind.config.js

export const colors = {
  bg: {
    primary: '#08090B',
    secondary: '#0D0F12',
    surface: '#111419',
    elevated: '#151922',
    subtle: '#1A1F2B',
  },
  border: {
    default: '#242833',
    subtle: '#1C2030',
    strong: '#3A4255',
  },
  text: {
    primary: '#F5F7FA',
    secondary: '#A7AFBC',
    muted: '#697282',
  },
  accent: {
    primary: '#5B7CFF',
    hover: '#4A6AEF',
    secondary: '#7C5CFF',
    subtle: 'rgba(91, 124, 255, 0.12)',
  },
  status: {
    success: '#36D399',
    warning: '#F5B94C',
    danger: '#FF5C6C',
  },
} as const

export const defectClasses = [
  {
    id: 'injection',
    label: 'Injection / Input Validation',
    shortLabel: 'Injection',
    description: 'Unsanitized input reaching sensitive operations',
    icon: 'Shield',
    color: '#FF5C6C',
  },
  {
    id: 'auth',
    label: 'Auth & Access Control',
    shortLabel: 'Auth',
    description: 'Authentication flaws and privilege issues',
    icon: 'Lock',
    color: '#F5B94C',
  },
  {
    id: 'error-handling',
    label: 'Error & Exception Handling',
    shortLabel: 'Error Handling',
    description: 'Unchecked returns, swallowed exceptions',
    icon: 'AlertTriangle',
    color: '#5B7CFF',
  },
  {
    id: 'concurrency',
    label: 'Concurrency & State',
    shortLabel: 'Concurrency',
    description: 'Race conditions, shared mutable state',
    icon: 'Zap',
    color: '#7C5CFF',
  },
  {
    id: 'logic',
    label: 'Logic & Boundary',
    shortLabel: 'Logic',
    description: 'Off-by-one errors, incorrect conditions',
    icon: 'GitBranch',
    color: '#36D399',
  },
  {
    id: 'resource',
    label: 'Resource & Performance',
    shortLabel: 'Resource',
    description: 'Memory leaks, N+1 queries, inefficient loops',
    icon: 'Gauge',
    color: '#A7AFBC',
  },
] as const

export type DefectClassId = typeof defectClasses[number]['id']
export type Difficulty = 'Easy' | 'Medium' | 'Hard'
export type ExerciseStatus = 'not-started' | 'completed' | 'needs-practice' | 'in-progress'
export type Language = 'Python' | 'JavaScript' | 'TypeScript' | 'Go' | 'Java' | 'Ruby'
