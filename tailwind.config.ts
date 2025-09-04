import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#B57F50",
          accent: "#F2D7A0",
          text: "#1F1F1F",
          bg: "#FFF9F1",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
