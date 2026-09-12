/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        den: {
          bg: '#0a0a0b',
          surface: '#111115',
          card: '#16161c',
          cardHover: '#1a1a22',
          border: '#1e1e28',
          borderHover: '#2a2a38',
          accent: '#a3e635',
          'accent-dim': '#84cc16',
          'accent-dark': '#4d7c0f',
          'accent-glow': 'rgba(163, 230, 53, 0.15)',
          text: '#f4f4f5',
          muted: '#71717a',
          subtle: '#3f3f46',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'den': '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.6)',
        'den-md': '0 4px 6px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.6)',
        'den-lg': '0 10px 15px rgba(0,0,0,0.5), 0 4px 6px rgba(0,0,0,0.4)',
        'den-xl': '0 20px 25px rgba(0,0,0,0.6), 0 10px 10px rgba(0,0,0,0.4)',
        'den-accent': '0 0 20px rgba(163, 230, 53, 0.2)',
        'den-accent-sm': '0 0 8px rgba(163, 230, 53, 0.15)',
        'glow': '0 0 30px rgba(163, 230, 53, 0.25)',
      },
      backgroundImage: {
        'den-gradient': 'linear-gradient(135deg, #0a0a0b 0%, #111115 100%)',
        'accent-gradient': 'linear-gradient(135deg, #a3e635 0%, #84cc16 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(22,22,28,0.9) 0%, rgba(26,26,34,0.7) 100%)',
        'hero-gradient': 'linear-gradient(135deg, #0a0a0b 0%, #0f1a0a 50%, #0a0a0b 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in-left': 'slideInLeft 0.25s ease-out',
        'slide-in-right': 'slideInRight 0.25s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'toast-in': 'toastIn 0.3s ease-out',
        'toast-out': 'toastOut 0.25s ease-in forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(163, 230, 53, 0.15)' },
          '50%': { boxShadow: '0 0 20px rgba(163, 230, 53, 0.35)' },
        },
        toastIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        toastOut: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(110%)', opacity: '0' },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
