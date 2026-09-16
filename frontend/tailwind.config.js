/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        atlas: {
          canvas: "#F6F3EC",
          surface: "#FFFFFF",
          surfaceSubtle: "#FAF8F5",
          forestDeep: "#173F35",
          forest: "#267A69",
          forestLight: "#E8F0EC",
          charcoal: "#26312D",
          secondary: "#66736D",
          muted: "#8C9893",
          ochre: "#C89432",
          ochreSoft: "#F5EEDB",
          terracotta: "#B74436",
          terracottaSoft: "#F5E7E4",
          border: "#DDD9D0",
          borderSubtle: "#EAE6DF",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
