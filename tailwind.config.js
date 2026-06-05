/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: { DEFAULT: '#F5C518', dark: '#C9A000', light: '#FFD84D' },
        surface: { DEFAULT: '#111111', 2: '#1A1A1A', 3: '#222222', 4: '#2A2A2A' }
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif']
      }
    }
  },
  plugins: []
}