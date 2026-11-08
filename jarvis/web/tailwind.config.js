/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        hud: { bg: '#020814', deep: '#04122a', cyan: '#3ee8ff', blue: '#1b8cff', dim: '#0d3a5c' },
      },
      fontFamily: { hud: ['"Rajdhani"', '"Orbitron"', 'system-ui', 'sans-serif'], mono: ['"Share Tech Mono"', 'ui-monospace', 'monospace'] },
    },
  },
  plugins: [],
}
