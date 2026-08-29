/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#08080A',
        surface: {
          DEFAULT: '#121216',
          subtle: '#18181F',
          card: 'rgba(255, 255, 255, 0.03)',
        },
        primary: {
          DEFAULT: '#007AFF',
          hover: '#0A84FF',
          dark: '#0056B3',
          glow: 'rgba(0, 122, 255, 0.35)',
        },
        accent: {
          cyan: '#30D158',
          purple: '#BF5AF2',
          orange: '#FF9F0A',
          red: '#FF453A',
        },
        glass: {
          border: 'rgba(255, 255, 255, 0.08)',
          'border-highlight': 'rgba(255, 255, 255, 0.18)',
          bg: 'rgba(14, 14, 18, 0.65)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glass-glow': '0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'blue-glow': '0 0 30px rgba(0, 122, 255, 0.45)',
        'card-glow': '0 30px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '0.75' },
        },
      }
    },
  },
  plugins: [],
}
