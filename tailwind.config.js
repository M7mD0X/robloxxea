/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Deep hacker palette — black backgrounds, dark-gray cards, neon accents
        void: {
          900: '#0a0a0f', // page bg (near-black with cool tint)
          800: '#11111a',
          700: '#181826',
          600: '#1f1f30'
        },
        neon: {
          cyan: '#22d3ee',
          purple: '#a855f7',
          pink: '#ec4899',
          green: '#4ade80'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        glow: '0 0 24px -4px rgba(34, 211, 238, 0.35)',
        'glow-purple': '0 0 24px -4px rgba(168, 85, 247, 0.4)'
      },
      animation: {
        'pulse-once': 'pulseOnce 600ms ease-in-out'
      },
      keyframes: {
        pulseOnce: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.04)' }
        }
      }
    }
  },
  plugins: []
};
