/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        nutri: {
          green: "#10b981",     // Protein green
          greenDark: "#059669",
          greenLight: "#d1fae5",
          orange: "#f97316",    // Calories orange
          orangeDark: "#ea580c",
          orangeLight: "#ffedd5",
          purple: "#8b5cf6",    // Weight purple
          purpleDark: "#7c3aed",
          purpleLight: "#ede9fe",
          blue: "#3b82f6",
          blueLight: "#eff6ff",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

