/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsDark: "#0F0F0F",
        obsRed: "#9e0b0f",
        obsGray: "#d1d5db",
      },
    },
  },
  plugins: [],
};
