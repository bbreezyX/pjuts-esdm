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
      borderRadius: {
        bento: "2.5rem",
      },
      colors: {
        // Updated ESDM Brand Colors
        primary: {
          DEFAULT: "#003366", // Deep Corporate Blue
          foreground: "#FFFFFF",
          50: "#e6ebf0",
          100: "#ccd7e1",
          200: "#99afc3",
          300: "#6687a5",
          400: "#335f87",
          500: "#003366",
          600: "#00295c",
          700: "#001f52",
          800: "#001548",
          900: "#000b3e",
        },
        accent: {
          DEFAULT: "#D4AF37", // Refined Gold
          foreground: "#FFFFFF",
        },
        esdm: {
          gold: "#D4AF37", // Refined Gold
          gray: "#E1E6EB", // Abu Muda Inovasi
          green: "#00B473", // Hijau Keberlanjutan
          navy: "#003366", // Deep Corporate Blue
          yellow: "#FFF500", // Kuning Energi (Keeping for reference)
        },
        // Status Colors
        status: {
          operational: "#10b981",
          maintenance: "#f59e0b",
          offline: "#ef4444",
          unverified: "#6b7280",
        },
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
