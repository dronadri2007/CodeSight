/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Deep Navy & Midnight Workspaces
        navy: {
          DEFAULT: '#0B1726',
          midnight: '#07111D',
          surface: '#0F1E31',
          elevated: '#15253C',
          subtle: '#1C314E',
          border: '#1E2C3D',
          borderStrong: '#2A3C52',
        },
        // Light Canvas & Marketing Surfaces
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
        // Primary Aqua Accent Identity
        aqua: {
          DEFAULT: '#20C7D9',
          bright: '#38D9E8',
          hover: '#19B5C6',
          soft: '#DDF8FA',
          subtle: 'rgba(32, 199, 217, 0.12)',
          border: 'rgba(32, 199, 217, 0.28)',
        },
        // Slate & Neutral
        slate: {
          DEFAULT: '#516173',
          muted: '#66758A',
        },
        // Feedback Accents
        success: {
          DEFAULT: '#19B47A',
          subtle: 'rgba(25, 180, 122, 0.12)',
          border: 'rgba(25, 180, 122, 0.25)',
        },
        warning: {
          DEFAULT: '#E6A23C',
          subtle: 'rgba(230, 162, 60, 0.12)',
          border: 'rgba(230, 162, 60, 0.25)',
        },
        danger: {
          DEFAULT: '#E25D67',
          subtle: 'rgba(226, 93, 103, 0.12)',
          border: 'rgba(226, 93, 103, 0.25)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Geist', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Inter', 'Geist', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        md: '10px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(11, 23, 38, 0.05)',
        DEFAULT: '0 2px 8px 0 rgba(11, 23, 38, 0.06), 0 1px 2px 0 rgba(11, 23, 38, 0.04)',
        'md': '0 4px 16px 0 rgba(11, 23, 38, 0.08), 0 2px 4px 0 rgba(11, 23, 38, 0.04)',
        'lg': '0 12px 32px 0 rgba(11, 23, 38, 0.12), 0 4px 8px 0 rgba(11, 23, 38, 0.06)',
        'xl': '0 20px 48px 0 rgba(11, 23, 38, 0.16), 0 8px 16px 0 rgba(11, 23, 38, 0.08)',
        'aqua-glow': '0 0 24px 0 rgba(32, 199, 217, 0.22)',
        'card': '0 1px 3px 0 rgba(11, 23, 38, 0.06), 0 1px 2px 0 rgba(11, 23, 38, 0.04)',
        'card-hover': '0 12px 32px -4px rgba(11, 23, 38, 0.12), 0 4px 12px -2px rgba(11, 23, 38, 0.06)',
        'dark-card': '0 4px 20px 0 rgba(0, 0, 0, 0.45)',
      },
    },
  },
  plugins: [],
}
