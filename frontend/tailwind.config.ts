/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0d0d1a',
        surface: '#1a1a2e',
        'surface-elevated': '#22223b',
        'surface-hover': '#2a2a45',
        border: 'rgba(255,255,255,0.08)',
        'border-strong': 'rgba(255,255,255,0.15)',
        primary: {
          DEFAULT: '#6c47ff',
          50: 'rgba(108,71,255,0.1)',
          100: 'rgba(108,71,255,0.2)',
          500: '#6c47ff',
          600: '#5a35ef',
          700: '#4a25df',
        },
        accent: '#8b5cf6',
        success: '#22d3a5',
        warning: '#fbbf24',
        error: '#f87171',
        text: {
          primary: '#ffffff',
          secondary: '#a0a0b2',
          muted: '#6b6b82',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6c47ff 0%, #8b5cf6 100%)',
        'gradient-surface': 'linear-gradient(180deg, #1a1a2e 0%, #0d0d1a 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(108,71,255,0.1) 0%, rgba(139,92,246,0.05) 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(108,71,255,0.3)',
        'glow-sm': '0 0 10px rgba(108,71,255,0.2)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.6)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      borderRadius: {
        'xl2': '1rem',
        'xl3': '1.25rem',
      },
    },
  },
  plugins: [],
}
