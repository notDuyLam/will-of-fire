/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Semantic: dùng bg-screen, text-primary để tự đổi theo dark/light
        screen: {
          DEFAULT: "#f8fafc",
          dark: "#0f172a",
        },
        primary: {
          DEFAULT: "#0f172a",
          dark: "#f8fafc",
        },
        muted: {
          DEFAULT: "#64748b",
          dark: "#94a3b8",
        },
        card: {
          DEFAULT: "#f1f5f9",
          dark: "#1e293b",
        },
        border: {
          DEFAULT: "#e2e8f0",
          dark: "#334155",
        },
        // Will of Fire custom palette
        fire: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        // Dark theme base colors
        slate: {
          850: '#172033',
          950: '#0B1120',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
