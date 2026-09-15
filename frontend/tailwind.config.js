/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: "#123B63",
          deep: "#0B2945",
          blue: "#1877C9",
          saffron: "#F59E0B",
          green: "#16804B",
          critical: "#C62828",
          surface: "#FFFFFF",
          bg: "#F5F7FA",
          text: "#172B4D",
          muted: "#64748B",
          border: "#D9E1EA",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
