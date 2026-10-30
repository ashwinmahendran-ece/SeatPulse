/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: '#050505',       // True Jet Black
        amethyst: '#4B0082',    // Royal Amethyst
        cyan: '#00FFFF',        // Electric Cyan
        white: '#FFFFFF',
        gray: '#1F1F1F',        // High-contrast divider line
      },
      fontFamily: {
        sans: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'], // Sharp, neutral geometric
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'], // Brutalist data accents
      },
    },
  },
  plugins: [],
}