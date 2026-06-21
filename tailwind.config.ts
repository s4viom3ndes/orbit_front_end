import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Orbit brand
        navy: {
          950: "#070d1a",
          900: "#0f1729",
          800: "#162036",
          700: "#1e2d48",
          600: "#263a5e",
        },
        teal: {
          400: "#2ECFE4",
          300: "#5DDAEC",
          500: "#1ab8cc",
        },
        indigo: {
          500: "#6366f1",
          400: "#818cf8",
          600: "#4f46e5",
        },
        success: "#22c55e",
        danger: "#ef4444",
        warning: "#f59e0b",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "orbit-gradient": "linear-gradient(135deg, #0f1729 0%, #162036 100%)",
        "teal-gradient": "linear-gradient(135deg, #2ECFE4 0%, #6366f1 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
