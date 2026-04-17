/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        aquaDeep: "#123744",
        aquaMid: "#1e4b58",
        aquaShade: "#0f2f3b",
        aquaAccent: "#2f5f6a",
        brandGold: "#f3be3d"
      }
    },
  },
  plugins: [],
};

