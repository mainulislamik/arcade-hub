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
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        arcade: {
          bg: '#090d16',
          card: '#111827',
          border: '#1f2937',
          accent: '#38bdf8',
          neon: '#a855f7',
          gold: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        pixel: ['"Press Start 2P"', 'monospace', 'sans-serif'],
        display: ['"Chakra Petch"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glow: {
          'from': { filter: 'drop-shadow(0 0 4px rgba(56, 189, 248, 0.4))' },
          'to': { filter: 'drop-shadow(0 0 12px rgba(168, 85, 247, 0.7))' }
        }
      }
    },
  },
  plugins: [],
}
