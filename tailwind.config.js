/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["system-ui", "ui-sans-serif", "sans-serif"],
      },
      colors: {
        "preg-pink": "#FFA4BC",
        "preg-peach": "#FFD9C4",
        "preg-rose": "#F97373",
        "preg-mint": "#B3E5D1",
        "preg-ink": "#111827",
      },
      boxShadow: {
        soft: "0 10px 25px rgba(0,0,0,0.05)",
      },
    },
  },
  plugins: [],
};
