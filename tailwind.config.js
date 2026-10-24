/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50:  '#F2F9F5',
          100: '#E1F2E8',
          200: '#C3E5D1',
          300: '#96D1B1',
          400: '#5EB688',
          500: '#2A965E',
          600: '#1B7A4B',
          700: '#14623C',
          800: '#0F4D2F',
          900: '#0B3B24',
          950: '#062316',
        },
        cream: {
          DEFAULT: '#FBF9F5',
          warm: '#F7F4EE',
          surface: '#FFFFFF',
          tint: '#F4EFE6',
        },
        stone: {
          50:  '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 8px 24px -6px rgba(12, 38, 24, 0.05)',
        'card-hover': '0 4px 12px 0 rgba(0, 0, 0, 0.04), 0 16px 36px -6px rgba(12, 38, 24, 0.1)',
        'glow': '0 0 24px -4px rgba(27, 122, 75, 0.2)',
        'inner-soft': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.8)',
      },
    },
  },
  plugins: [],
}
