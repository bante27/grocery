/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // 👈 important for ThemeContext to work
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
