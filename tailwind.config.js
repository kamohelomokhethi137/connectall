/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0B1D3A",
          light: "#122A52",
          dark: "#071429",
        },
        teal: {
          DEFAULT: "#17A398",
          light: "#1FBFB1",
          dark: "#0E7E75",
        },
        gold: {
          DEFAULT: "#E8A33D",
          light: "#F2B85E",
          dark: "#C4841F",
        },
        coral: {
          DEFAULT: "#EF6558",
          light: "#F4897E",
          dark: "#D14C40",
        },
        paper: "#F1F4F8",
        ink: "#10192B",
        "ink-soft": "#4A5568",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
