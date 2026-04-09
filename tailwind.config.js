/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffead5',
          200: '#ffd0a6',
          300: '#ffaf6d',
          400: '#ff832c',
          500: '#ff6200', // Electric Orange
          600: '#ef4900',
          700: '#c63402',
          800: '#9d290a',
          900: '#7e240c',
          950: '#440f04',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617', // Deep Space
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 20px rgba(255, 98, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
