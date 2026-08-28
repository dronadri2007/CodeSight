/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Main Midnight & Deep Surface Workspaces
        midnight: {
          DEFAULT: '#0D1117',
          surface: '#151C24',
          elevated: '#1A232D',
          subtle: '#202A31',
        },
        surface: {
          DEFAULT: '#151C24',
          elevated: '#1A232D',
          subtle: '#202A31',
        },
        // Text Palette
        ivory: {
          DEFAULT: '#F4F1E8',
          soft: '#DDD9CF',
          muted: '#AEB7B2',
        },
        // Primary Teal Brand Accent
        teal: {
          DEFAULT: '#35C6B0',
          bright: '#58D8C5',
          hover: '#58D8C5',
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
        // Border Palette
        borderDark: {
          DEFAULT: '#29333A',
          subtle: '#202A31',
          strong: '#37454E',
        },
        // Feedback Accents
        success: {
          DEFAULT: '#35B889',
          subtle: 'rgba(53, 184, 137, 0.12)',
          border: 'rgba(53, 184, 137, 0.25)',
        },
        warning: {
          DEFAULT: '#D9A441',
          subtle: 'rgba(217, 164, 65, 0.12)',
          border: 'rgba(217, 164, 65, 0.25)',
        },
        danger: {
          DEFAULT: '#E0646D',
          subtle: 'rgba(224, 100, 109, 0.12)',
          border: 'rgba(224, 100, 109, 0.25)',
        },
        // Compatibility Aliases mapped to new Palette
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
        light: {
          bg: '#0D1117',
          card: '#151C24',
          elevated: '#1A232D',
          border: '#29333A',
          borderStrong: '#37454E',
          text: '#F4F1E8',
          textSecondary: '#DDD9CF',
          textMuted: '#AEB7B2',
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
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        DEFAULT: '0 2px 8px 0 rgba(0, 0, 0, 0.35)',
        'md': '0 4px 16px 0 rgba(0, 0, 0, 0.4)',
        'lg': '0 12px 32px 0 rgba(0, 0, 0, 0.45)',
        'xl': '0 20px 48px 0 rgba(0, 0, 0, 0.5)',
        'aqua-glow': '0 0 24px 0 rgba(53, 198, 176, 0.25)',
        'teal-glow': '0 0 24px 0 rgba(53, 198, 176, 0.25)',
        'gold-glow': '0 0 24px 0 rgba(217, 164, 65, 0.25)',
        'card': '0 2px 8px 0 rgba(0, 0, 0, 0.35)',
        'card-hover': '0 12px 32px -4px rgba(0, 0, 0, 0.5)',
        'dark-card': '0 4px 20px 0 rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}
