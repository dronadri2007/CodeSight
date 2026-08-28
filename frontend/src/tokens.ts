// CodeSight Design Tokens — Midnight + Ivory + Teal + Warm Gold Identity

export const colors = {
  // Midnight & Deep Surface Backgrounds
  midnight: {
    DEFAULT: '#0D1117',
    surface: '#151C24',
    elevated: '#1A232D',
    subtle: '#202A31',
  },
  // Text Shades (Ivory & Greys)
  text: {
    ivory: '#F4F1E8',
    softIvory: '#DDD9CF',
    mutedGrey: '#AEB7B2',
  },
  // Main Brand Accent (Teal)
  teal: {
    DEFAULT: '#35C6B0',
    bright: '#58D8C5',
    soft: '#BFEDE5',
    subtle: 'rgba(53, 198, 176, 0.12)',
    border: 'rgba(53, 198, 176, 0.30)',
  },
  // Warm Gold (Achievements, milestones, special highlights)
  gold: {
    DEFAULT: '#D9A441',
    highlight: '#E8BC5A',
    subtle: 'rgba(217, 164, 65, 0.12)',
    border: 'rgba(217, 164, 65, 0.30)',
  },
  // Borders
  border: {
    DEFAULT: '#29333A',
    subtle: '#202A31',
    strong: '#37454E',
  },
  // Feedback Accents
  feedback: {
    success: '#35B889',
    successSubtle: 'rgba(53, 184, 137, 0.12)',
    warning: '#D9A441',
    warningSubtle: 'rgba(217, 164, 65, 0.12)',
    danger: '#E0646D',
    dangerSubtle: 'rgba(224, 100, 109, 0.12)',
  },
  // Backward compatibility alias mappings
  navy: {
    DEFAULT: '#0D1117',
    midnight: '#0D1117',
    surface: '#151C24',
    elevated: '#1A232D',
    subtle: '#202A31',
    border: '#29333A',
    borderStrong: '#37454E',
  },
  aqua: {
    DEFAULT: '#35C6B0',
    bright: '#58D8C5',
    hover: '#58D8C5',
    soft: '#BFEDE5',
    subtle: 'rgba(53, 198, 176, 0.12)',
    border: 'rgba(53, 198, 176, 0.30)',
  },
  slate: {
    DEFAULT: '#AEB7B2',
    muted: '#AEB7B2',
  },
} as const

export const defectClasses = [
  {
    id: 'injection',
    label: 'Injection / Input Validation',
    shortLabel: 'Injection',
    description: 'Unsanitized input reaching sensitive operations and query builders',
    icon: 'Shield',
    color: '#E0646D',
    bgColor: 'rgba(224, 100, 109, 0.10)',
    borderColor: 'rgba(224, 100, 109, 0.25)',
  },
  {
    id: 'auth',
    label: 'Auth & Access Control',
    shortLabel: 'Auth',
    description: 'Timing attacks, token validation flaws, and permission checks',
    icon: 'Lock',
    color: '#D9A441',
    bgColor: 'rgba(217, 164, 65, 0.10)',
    borderColor: 'rgba(217, 164, 65, 0.25)',
  },
  {
    id: 'error-handling',
    label: 'Error & Exception Handling',
    shortLabel: 'Error Handling',
    description: 'Unchecked return values, swallowed async errors, and nil leaks',
    icon: 'AlertTriangle',
    color: '#35C6B0',
    bgColor: 'rgba(53, 198, 176, 0.10)',
    borderColor: 'rgba(53, 198, 176, 0.25)',
  },
  {
    id: 'concurrency',
    label: 'Concurrency & State',
    shortLabel: 'Concurrency',
    description: 'Race conditions, unsynchronized mutations, and shared mutable state',
    icon: 'Zap',
    color: '#58D8C5',
    bgColor: 'rgba(88, 216, 197, 0.10)',
    borderColor: 'rgba(88, 216, 197, 0.25)',
  },
  {
    id: 'logic',
    label: 'Logic & Boundary',
    shortLabel: 'Logic',
    description: 'Off-by-one loops, inverted conditions, and edge-case mishandling',
    icon: 'GitBranch',
    color: '#35B889',
    bgColor: 'rgba(53, 184, 137, 0.10)',
    borderColor: 'rgba(53, 184, 137, 0.25)',
  },
  {
    id: 'resource',
    label: 'Resource & Performance',
    shortLabel: 'Resource',
    description: 'Connection pool leaks, unbounded cache growth, and N+1 queries',
    icon: 'Gauge',
    color: '#AEB7B2',
    bgColor: 'rgba(174, 183, 178, 0.12)',
    borderColor: 'rgba(174, 183, 178, 0.25)',
  },
] as const

export type DefectClassId = typeof defectClasses[number]['id']
export type UserRole = 'student' | 'professional'
export type Difficulty = 'Easy' | 'Medium' | 'Hard'
