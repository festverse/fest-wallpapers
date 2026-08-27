import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-sora)", "sans-serif"],
        body: ["var(--font-manrope)", "sans-serif"]
      },
      colors: {
        ink: {
          950: "#08090c",
          900: "#0d0f14",
          850: "#12151c",
          800: "#181c25",
          700: "#232936",
          500: "#4a5266",
          300: "#9aa3b5",
          100: "#e6e9ef"
        },
        bone: {
          50: "#faf9f6",
          100: "#f1efe9",
          200: "#e3dfd4",
          400: "#b8b2a1"
        },
        ember: {
          300: "#f2c48d",
          400: "#e8a95c",
          500: "#d98f3a",
          600: "#b06f24"
        }
      },
      transitionTimingFunction: {
        swift: "cubic-bezier(0.22, 1, 0.36, 1)"
      }
    }
  },
  plugins: []
};

export default config;
