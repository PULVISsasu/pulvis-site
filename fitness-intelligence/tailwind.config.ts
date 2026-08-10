import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f6ff",
          100: "#e2eaff",
          200: "#c6d6ff",
          300: "#9fb8ff",
          400: "#7091ff",
          500: "#4a66f5",
          600: "#3548d6",
          700: "#2b39ac",
          800: "#26308a",
          900: "#232c6f",
          950: "#161a42",
        },
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
