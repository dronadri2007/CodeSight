/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'bg-primary': '#08090B',
        'bg-secondary': '#0D0F12',
        'bg-surface': '#111419',
        'bg-elevated': '#151922',
        'bg-subtle': '#1A1F2B',
        // Borders
        border: '#242833',
        'border-subtle': '#1C2030',
        'border-strong': '#3A4255',
        // Text
        'text-primary': '#F5F7FA',
        'text-secondary': '#A7AFBC',
        'text-muted': '#697282',
        // Accent
        'accent': '#5B7CFF',
        'accent-hover': '#4A6AEF',
        'accent-secondary': '#7C5CFF',
        'accent-subtle': 'rgba(91, 124, 255, 0.12)',
        'accent-subtle-hover': 'rgba(91, 124, 255, 0.18)',
        // Status
        success: '#36D399',
        'success-subtle': 'rgba(54, 211, 153, 0.12)',
        warning: '#F5B94C',
        'warning-subtle': 'rgba(245, 185, 76, 0.12)',
        danger: '#FF5C6C',
        'danger-subtle': 'rgba(255, 92, 108, 0.12)',
        // Difficulty
        easy: '#36D399',
        medium: '#F5B94C',
        hard: '#FF5C6C',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
        xs: ['0.75rem', { lineHeight: '1.125rem' }],
        sm: ['0.875rem', { lineHeight: '1.375rem' }],
        base: ['1rem', { lineHeight: '1.625rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.875rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.375rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.75rem' }],
        '5xl': ['3rem', { lineHeight: '3.5rem' }],
        '6xl': ['3.75rem', { lineHeight: '4.25rem' }],
        '7xl': ['4.5rem', { lineHeight: '5rem' }],
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
        snug: '-0.01em',
        normal: '0em',
        wide: '0.02em',
        wider: '0.05em',
        widest: '0.1em',
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '10px',
        xl: '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0,0,0,0.4)',
        DEFAULT: '0 2px 8px 0 rgba(0,0,0,0.45), 0 1px 2px 0 rgba(0,0,0,0.3)',
        'md': '0 4px 16px 0 rgba(0,0,0,0.5), 0 2px 4px 0 rgba(0,0,0,0.3)',
        'lg': '0 8px 32px 0 rgba(0,0,0,0.55), 0 4px 8px 0 rgba(0,0,0,0.3)',
        'xl': '0 16px 48px 0 rgba(0,0,0,0.6), 0 8px 16px 0 rgba(0,0,0,0.3)',
        'card': '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 2px 8px 0 rgba(0,0,0,0.45)',
        'card-hover': '0 1px 0 0 rgba(255,255,255,0.06) inset, 0 4px 20px 0 rgba(0,0,0,0.55)',
        'accent-glow': '0 0 20px 0 rgba(91,124,255,0.15)',
        'none': 'none',
      },
      spacing: {
        '13': '3.25rem',
        '15': '3.75rem',
        '17': '4.25rem',
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'count-up': 'countUp 0.8s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
        'score-reveal': 'scoreReveal 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        scoreReveal: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
