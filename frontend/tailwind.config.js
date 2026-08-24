/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        surface: {
          950: "#0a0f1a",
          900: "#0d1420",
          800: "#121b2b",
          700: "#1a2436",
          600: "#243044",
        },
        accent: {
          amber: "#f0a84e",
          cyan: "#3fc6d4",
        },
        severity: {
          p1: "#e5484d",
          p2: "#f0a84e",
          p3: "#e8c547",
          p4: "#4c9be8",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(240,168,78,0.15), 0 8px 24px -8px rgba(240,168,78,0.25)",
      },
    },
  },
  plugins: [],
};
