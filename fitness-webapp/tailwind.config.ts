import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F1EFE7",
        ink: "#1C1B19",
        line: "#D8D3C4",
        glaucous: "#466964",
        glaucousDark: "#2F4845",
        clay: "#B5542E",
        chalk: "#FBFAF6",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
};

export default config;
