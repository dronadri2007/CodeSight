// CodeSight Design Tokens — Black + Dark Warm Brown + Coffee + Warm Ivory Identity

export const colors = {
  // 1. BLACK — Deepest background & main dark sections
  black: {
    DEFAULT: '#000000',
    deep: '#000000',
  },
  // 2. DARK WARM BROWN — Cards, panels, navigation, secondary backgrounds
  darkWarmBrown: {
    DEFAULT: '#1A130D',
    surface: '#1A130D',
    panel: '#1A130D',
  },
  // 3. WARM DARK BROWN / COFFEE — Elevated elements, borders, secondary buttons, depth
  coffee: {
    DEFAULT: '#3A2F1D',
    elevated: '#3A2F1D',
    border: '#3A2F1D',
    hover: '#4A3D27',
    subtle: 'rgba(58, 47, 29, 0.50)',
  },
  // 4. WARM IVORY / CREAM — Primary text, headings, primary buttons, highlights
  ivory: {
    DEFAULT: '#E5DFC9',
    soft: 'rgba(229, 223, 201, 0.75)',
    muted: 'rgba(229, 223, 201, 0.50)',
    bright: '#F2EDDE',
    subtle: 'rgba(229, 223, 201, 0.12)',
    border: 'rgba(229, 223, 201, 0.25)',
  },
  // Surface Mappings
  surface: {
    DEFAULT: '#1A130D',
    elevated: '#3A2F1D',
    subtle: '#140E0A',
  },
  // Border Mappings
  border: {
    DEFAULT: '#3A2F1D',
    subtle: 'rgba(58, 47, 29, 0.50)',
    strong: '#4A3D27',
  },
  // Text Mappings
  text: {
    primary: '#E5DFC9',
    secondary: 'rgba(229, 223, 201, 0.75)',
    muted: 'rgba(229, 223, 201, 0.50)',
  },
  // Backward compatibility alias mappings
  midnight: {
    DEFAULT: '#000000',
    surface: '#1A130D',
    elevated: '#3A2F1D',
    subtle: '#140E0A',
  },
  navy: {
    DEFAULT: '#000000',
    midnight: '#000000',
    surface: '#1A130D',
    elevated: '#3A2F1D',
    subtle: '#140E0A',
    border: '#3A2F1D',
    borderStrong: '#4A3D27',
  },
  teal: {
    DEFAULT: '#E5DFC9',
    bright: '#F2EDDE',
    soft: '#E5DFC9',
    subtle: 'rgba(229, 223, 201, 0.12)',
    border: 'rgba(229, 223, 201, 0.30)',
  },
  aqua: {
    DEFAULT: '#E5DFC9',
    bright: '#F2EDDE',
    hover: '#F2EDDE',
    soft: '#E5DFC9',
    subtle: 'rgba(229, 223, 201, 0.12)',
    border: 'rgba(229, 223, 201, 0.30)',
  },
  gold: {
    DEFAULT: '#E5DFC9',
    highlight: '#F2EDDE',
    subtle: 'rgba(229, 223, 201, 0.12)',
    border: 'rgba(229, 223, 201, 0.30)',
  },
  feedback: {
    success: '#E5DFC9',
    successSubtle: 'rgba(229, 223, 201, 0.12)',
    warning: '#E5DFC9',
    warningSubtle: 'rgba(229, 223, 201, 0.12)',
    danger: '#E5DFC9',
    dangerSubtle: 'rgba(229, 223, 201, 0.12)',
  },
} as const

export const defectClasses = [
  {
    id: 'injection',
    label: 'Injection / Input Validation',
    shortLabel: 'Injection',
    description: 'Unsanitized input reaching sensitive operations and query builders',
    icon: 'Shield',
    color: '#E5DFC9',
    bgColor: 'rgba(58, 47, 29, 0.50)',
    borderColor: '#3A2F1D',
  },
  {
    id: 'auth',
    label: 'Auth & Access Control',
    shortLabel: 'Auth',
    description: 'Timing attacks, token validation flaws, and permission checks',
    icon: 'Lock',
    color: '#E5DFC9',
    bgColor: 'rgba(58, 47, 29, 0.50)',
    borderColor: '#3A2F1D',
  },
  {
    id: 'error-handling',
    label: 'Error & Exception Handling',
    shortLabel: 'Error Handling',
    description: 'Unchecked return values, swallowed async errors, and nil leaks',
    icon: 'AlertTriangle',
    color: '#E5DFC9',
    bgColor: 'rgba(58, 47, 29, 0.50)',
    borderColor: '#3A2F1D',
  },
  {
    id: 'concurrency',
    label: 'Concurrency & State',
    shortLabel: 'Concurrency',
    description: 'Race conditions, unsynchronized mutations, and shared mutable state',
    icon: 'Zap',
    color: '#E5DFC9',
    bgColor: 'rgba(58, 47, 29, 0.50)',
    borderColor: '#3A2F1D',
  },
  {
    id: 'logic',
    label: 'Logic & Boundary',
    shortLabel: 'Logic',
    description: 'Off-by-one loops, inverted conditions, and edge-case mishandling',
    icon: 'GitBranch',
    color: '#E5DFC9',
    bgColor: 'rgba(58, 47, 29, 0.50)',
    borderColor: '#3A2F1D',
  },
  {
    id: 'resource',
    label: 'Resource & Performance',
    shortLabel: 'Resource',
    description: 'Connection pool leaks, unbounded cache growth, and N+1 queries',
    icon: 'Gauge',
    color: '#E5DFC9',
    bgColor: 'rgba(58, 47, 29, 0.50)',
    borderColor: '#3A2F1D',
  },
] as const

export type DefectClassId = typeof defectClasses[number]['id']
export type UserRole = 'student' | 'professional'
export type Difficulty = 'Easy' | 'Medium' | 'Hard'
