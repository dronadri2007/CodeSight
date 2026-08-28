// CodeSight Design Tokens — Deep Navy & Aqua Identity
// Inspired by Linear, Vercel, Raycast, and LeetCode

export const colors = {
  // Deep Backgrounds & Navies
  navy: {
    DEFAULT: '#0B1726',
    midnight: '#07111D',
    surface: '#0F1E31',
    elevated: '#15253C',
    subtle: '#1C314E',
    border: '#1E2C3D',
  },
  // Light Backgrounds & Surfaces
  light: {
    bg: '#F3F7FA',
    card: '#FFFFFF',
    elevated: '#F7FAFC',
    border: '#DCE4EA',
    borderStrong: '#CBD5E1',
    text: '#102033',
    textSecondary: '#516173',
    textMuted: '#66758A',
  },
  // Primary Aqua Accents (Brand Identity)
  aqua: {
    DEFAULT: '#20C7D9',
    bright: '#38D9E8',
    hover: '#19B5C6',
    soft: '#DDF8FA',
    subtle: 'rgba(32, 199, 217, 0.12)',
    border: 'rgba(32, 199, 217, 0.28)',
  },
  // Feedback Accents
  feedback: {
    success: '#19B47A',
    successSubtle: 'rgba(25, 180, 122, 0.12)',
    warning: '#E6A23C',
    warningSubtle: 'rgba(230, 162, 60, 0.12)',
    danger: '#E25D67',
    dangerSubtle: 'rgba(226, 93, 103, 0.12)',
  },
} as const

export const defectClasses = [
  {
    id: 'injection',
    label: 'Injection / Input Validation',
    shortLabel: 'Injection',
    description: 'Unsanitized input reaching sensitive operations and query builders',
    icon: 'Shield',
    color: '#E25D67',
    bgColor: 'rgba(226, 93, 103, 0.10)',
    borderColor: 'rgba(226, 93, 103, 0.25)',
  },
  {
    id: 'auth',
    label: 'Auth & Access Control',
    shortLabel: 'Auth',
    description: 'Timing attacks, token validation flaws, and permission checks',
    icon: 'Lock',
    color: '#E6A23C',
    bgColor: 'rgba(230, 162, 60, 0.10)',
    borderColor: 'rgba(230, 162, 60, 0.25)',
  },
  {
    id: 'error-handling',
    label: 'Error & Exception Handling',
    shortLabel: 'Error Handling',
    description: 'Unchecked return values, swallowed async errors, and nil leaks',
    icon: 'AlertTriangle',
    color: '#20C7D9',
    bgColor: 'rgba(32, 199, 217, 0.10)',
    borderColor: 'rgba(32, 199, 217, 0.25)',
  },
  {
    id: 'concurrency',
    label: 'Concurrency & State',
    shortLabel: 'Concurrency',
    description: 'Race conditions, unsynchronized mutations, and shared mutable state',
    icon: 'Zap',
    color: '#38D9E8',
    bgColor: 'rgba(56, 217, 232, 0.10)',
    borderColor: 'rgba(56, 217, 232, 0.25)',
  },
  {
    id: 'logic',
    label: 'Logic & Boundary',
    shortLabel: 'Logic',
    description: 'Off-by-one loops, inverted conditions, and edge-case mishandling',
    icon: 'GitBranch',
    color: '#19B47A',
    bgColor: 'rgba(25, 180, 122, 0.10)',
    borderColor: 'rgba(25, 180, 122, 0.25)',
  },
  {
    id: 'resource',
    label: 'Resource & Performance',
    shortLabel: 'Resource',
    description: 'Connection pool leaks, unbounded cache growth, and N+1 queries',
    icon: 'Gauge',
    color: '#516173',
    bgColor: 'rgba(81, 97, 115, 0.12)',
    borderColor: 'rgba(81, 97, 115, 0.25)',
  },
] as const

export type DefectClassId = typeof defectClasses[number]['id']
export type UserRole = 'student' | 'professional'
export type Difficulty = 'Easy' | 'Medium' | 'Hard'
