import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "gray-875": "#1c2740",
        primary: "#4f46e5",
        secondary: "#4c308c",
        danger: "#e03131",
        success: "#2f9e44",
        dark: {
          bg: "#0A0F1A",
          card: "#111827",
          border: "rgba(99, 102, 241, 0.1)",
          input: "#1F2937",
          hover: "#1E293B",
        },
        light: {
          bg: "#f9fafb",
          card: "#ffffff",
          border: "rgba(99, 102, 241, 0.2)",
          input: "#f3f4f6",
          hover: "#f1f5f9",
        },
      },
      fontSize: {
        xxs: "0.625rem", // 10px
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  darkMode: "class",
  plugins: [heroui(), require("tailwind-scrollbar")],
};

module.exports = config;
