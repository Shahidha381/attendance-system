/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#f2f2f2",
          100: "#e6e6e6",
          200: "#cccccc",
          300: "#b3b3b3",
          400: "#808080",
          500: "#4d4d4d",
          600: "#1a1a1a",
          700: "#111111",
          800: "#0a0a0a",
          900: "#000000",
        }
      }
    }
  },
  plugins: [],
};