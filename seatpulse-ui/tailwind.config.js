/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        page: '#F8F6F2', surface: '#FFFEFB', badge: '#F6F4EF', line: '#DCD8D2',
        brand: '#6735E8', brandLight: '#EDE6FC', brandDeep: '#5022BE', ink: '#242224', muted: '#726E75',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
