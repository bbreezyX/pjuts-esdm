import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ESDM Brand Colors
        primary: {
          50: "#e6f0fa",
          100: "#cce0f5",
          200: "#99c2eb",
          300: "#66a3e0",
          400: "#3385d6",
          500: "#0066cc",
          600: "#003366",
          700: "#002b57",
          800: "#002244",
          900: "#001a33",
          950: "#001122",
        },
        // Status Colors
        status: {
          operational: "#10b981",
          maintenance: "#f59e0b",
          offline: "#ef4444",
          unverified: "#6b7280",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out forwards",
        "slide-in-right": "slideInRight 0.3s ease-out forwards",
        shimmer: "shimmer 1.5s infinite",
        marquee: "marquee 30s linear infinite",
      },
      keyframes: {
        fadeIn: {
          from: {
            opacity: "0",
            transform: "translateY(10px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        slideInRight: {
          from: {
            opacity: "0",
            transform: "translateX(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        shimmer: {
          "0%": {
            backgroundPosition: "-200% 0",
          },
          "100%": {
            backgroundPosition: "200% 0",
          },
        },
        marquee: {
          "0%": {
            transform: "translateX(0%)",
          },
          "100%": {
            transform: "translateX(-50%)",
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
