/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F5F0',
        paper: '#FBF9F5',
        surface: '#EFECE6',
        'surface-subtle': '#E8E5DD',
        'surface-dark': '#0D0E11',
        'surface-dark-card': '#14161C',
        ink: {
          900: '#0E0F12',
          800: '#1C1D22',
          700: '#2F3138',
          500: '#646670',
          400: '#8A8C96',
          300: '#B8BAC4',
          200: '#DCDFE6',
          100: '#EFEFEA'
        },
        safety: {
          alert: '#D9381E',
          'alert-subtle': '#FDEDEA',
          warn: '#D97706',
          safe: '#1E5E3A',
          'safe-subtle': '#E9F5EE',
        }
      },
      fontFamily: {
        serif: ['"Cinzel Decorative"', '"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Space Mono"', 'monospace'],
      },
      letterSpacing: {
        'tightest': '-0.04em',
        'tighter': '-0.02em',
        'widest-xl': '0.25em',
        'widest-2xl': '0.35em',
      },
      borderRadius: {
        'none': '0px',
        'sm': '2px',
        'md': '4px',
        'lg': '6px',
        'xl': '8px',
      }
    },
  },
  plugins: [],
}
