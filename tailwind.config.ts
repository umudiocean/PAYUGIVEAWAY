import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark Neon Contest Palette
        neon: {
          pink: '#FF2A6D',
          teal: '#2BB673',
          purple: '#6A00FF',
          gold: '#FFD700',
          success: '#3BD671',
          error: '#FF4545',
        },
        dark: {
          bg: '#0B0F14',
          card: 'rgba(0, 0, 0, 0.8)',
          text: '#A7AAB3',
        }
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
        'neon-flicker': 'neon-flicker 1.5s infinite alternate',
        'slot-machine': 'slot-machine 0.5s ease-in-out',
        'particle-float': 'particle-float 6s ease-in-out infinite',
        'neon-glow': 'neon-glow 1s ease-in-out infinite alternate',
      },
      keyframes: {
        'glow-pulse': {
          '0%': { 
            boxShadow: '0 0 5px #FF2A6D, 0 0 10px #FF2A6D, 0 0 15px #FF2A6D',
            transform: 'scale(1)'
          },
          '100%': { 
            boxShadow: '0 0 10px #FF2A6D, 0 0 20px #FF2A6D, 0 0 30px #FF2A6D',
            transform: 'scale(1.02)'
          }
        },
        'neon-flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' }
        },
        'slot-machine': {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0)' }
        },
        'particle-float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)' }
        },
        'neon-glow': {
          '0%': { 
            boxShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor',
          },
          '100%': { 
            boxShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
          }
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      fontFamily: {
        'neon': ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
};
export default config;
