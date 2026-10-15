/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f0f7f0",
          100: "#dbecdb",
          200: "#b8dab8",
          300: "#88c088",
          400: "#5a9e5a",
          500: "#3d7e3d",
          600: "#2d6b2d",
          700: "#245524",
          800: "#1e441e",
          900: "#173717",
        },
        mint: {
          50: "#effaf4",
          100: "#d8f3e3",
          200: "#b3e6c8",
          300: "#82d3a8",
          400: "#52bb88",
          500: "#34a472",
          600: "#26885c",
          700: "#1f6c4a",
          800: "#1b573d",
          900: "#164833",
        },
        beige: {
          50: "#fdfbf7",
          100: "#f7f1e6",
          200: "#ede2cc",
          300: "#e0cfac",
          400: "#d0b885",
          500: "#c2a366",
          600: "#b69256",
          700: "#9c7848",
          800: "#836241",
          900: "#6d5239",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
