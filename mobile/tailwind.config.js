/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1e40af",
        success: "#16a34a",
        warning: "#f97316",
        danger: "#ef4444"
      }
    },
  },
  plugins: [],
}
