/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fire: {
          low: '#22c55e',      // green
          medium: '#eab308',   // yellow
          high: '#f97316',     // orange
          extreme: '#ef4444',  // red
        },
        dark: {
          bg: '#0a0d14',
          card: '#121824',
          border: '#1f293d',
          hover: '#1a2334'
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
