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
        },
        // PancakeSwap Dark Theme Colors
        pancake: {
          bg: '#08060E',
          card: '#27262C',
          'card-hover': '#372F47',
          primary: '#7645D9',
          'primary-dark': '#5121B1',
          secondary: '#1FC7D4',
          text: '#F4EEFF',
          'text-dim': '#B8ADD2',
          'text-disabled': '#666171',
          success: '#31D0AA',
          warning: '#FFB237',
          danger: '#ED4B9E',
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
        'kanit': ['Kanit', 'sans-serif'],
      },
      borderRadius: {
        'pancake': '32px',
        'pancake-inner': '16px',
        'pancake-button': '16px',
        'pancake-swap': '12px',
      },
      boxShadow: {
        'pancake': '0px 20px 36px -8px rgba(14, 14, 44, 0.1)',
        'pancake-button': '0 0 20px rgba(118, 69, 217, 0.5)',
      }
    },
  },
  plugins: [],
};
export default config;
