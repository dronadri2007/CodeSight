/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 1. BLACK — Deepest background & main dark sections
        black: {
          DEFAULT: '#000000',
          deep: '#000000',
        },
        // 2. DARK WARM BROWN — Cards, panels, navigation, secondary backgrounds
        darkBrown: {
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
        // Surface & Border Mappings
        surface: {
          DEFAULT: '#1A130D',
          elevated: '#3A2F1D',
          subtle: '#140E0A',
        },
        borderDark: {
          DEFAULT: '#3A2F1D',
          subtle: 'rgba(58, 47, 29, 0.50)',
          strong: '#4A3D27',
        },
        // Compatibility Aliases for entire UI
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
          hover: '#F2EDDE',
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
        slate: {
          DEFAULT: 'rgba(229, 223, 201, 0.50)',
          muted: 'rgba(229, 223, 201, 0.50)',
        },
        success: {
          DEFAULT: '#E5DFC9',
          subtle: 'rgba(229, 223, 201, 0.12)',
          border: 'rgba(229, 223, 201, 0.25)',
        },
        warning: {
          DEFAULT: '#E5DFC9',
          subtle: 'rgba(229, 223, 201, 0.12)',
          border: 'rgba(229, 223, 201, 0.25)',
        },
        danger: {
          DEFAULT: '#E5DFC9',
          subtle: 'rgba(229, 223, 201, 0.12)',
          border: 'rgba(229, 223, 201, 0.25)',
        },
        light: {
          bg: '#000000',
          card: '#1A130D',
          elevated: '#3A2F1D',
          border: '#3A2F1D',
          borderStrong: '#4A3D27',
          text: '#E5DFC9',
          textSecondary: 'rgba(229, 223, 201, 0.75)',
          textMuted: 'rgba(229, 223, 201, 0.50)',
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
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        DEFAULT: '0 2px 8px 0 rgba(0, 0, 0, 0.5)',
        'md': '0 4px 16px 0 rgba(0, 0, 0, 0.6)',
        'lg': '0 12px 32px 0 rgba(0, 0, 0, 0.7)',
        'xl': '0 20px 48px 0 rgba(0, 0, 0, 0.8)',
        'aqua-glow': '0 0 20px 0 rgba(229, 223, 201, 0.15)',
        'teal-glow': '0 0 20px 0 rgba(229, 223, 201, 0.15)',
        'gold-glow': '0 0 20px 0 rgba(229, 223, 201, 0.15)',
        'card': '0 2px 8px 0 rgba(0, 0, 0, 0.5)',
        'card-hover': '0 12px 32px -4px rgba(0, 0, 0, 0.7)',
        'dark-card': '0 4px 20px 0 rgba(0, 0, 0, 0.7)',
      },
    },
  },
  plugins: [],
}
