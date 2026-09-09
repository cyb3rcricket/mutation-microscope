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
        obsidian: {
          950: '#05070B',
          900: '#070A0F',
          850: '#0B0F17',
          800: '#101622',
          750: '#151D2D',
          700: '#1B2539',
        },
        dna: {
          cyan: '#22d3ee',
          emerald: '#34d399',
          amber: '#fbbf24',
          rose: '#f43f5e',
          violet: '#a855f7',
          blue: '#38bdf8',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -5px rgba(34, 211, 238, 0.4)',
        'glow-emerald': '0 0 20px -5px rgba(52, 211, 153, 0.4)',
        'glow-amber': '0 0 20px -5px rgba(251, 191, 36, 0.4)',
        'glow-rose': '0 0 20px -5px rgba(244, 63, 94, 0.4)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'morph-base': 'morph 0.5s ease-in-out',
      },
      keyframes: {
        morph: {
          '0%': { transform: 'scale(0.85)', opacity: '0.4' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
