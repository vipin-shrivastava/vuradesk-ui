/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-navy': '#263238',
        'primary-blue': '#00A3E0',
        'light-gray': '#F5F7F9',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        geist: ['Geist', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
