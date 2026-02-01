/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FDFBF7',
          50: '#FFFEFC',
          100: '#FDFBF7',
          200: '#F5F1E8',
          300: '#EBE5D5',
          900: '#3D3A30'
        },
        richred: {
          DEFAULT: '#8B0000',
          50: '#FCECEC',
          100: '#FADADA',
          200: '#F2AFAF',
          500: '#D91A1A',
          600: '#B31212',
          700: '#8B0000',
          800: '#660000',
          900: '#3B0000',
        },
        slate: {
            900: '#0f172a',
            600: '#475569',
            100: '#f1f5f9',
            200: '#e2e8f0'
        }
      },
    },
  },
  plugins: [],
}
