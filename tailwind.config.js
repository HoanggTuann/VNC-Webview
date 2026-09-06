/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6750a4",
        "primary-dark": "#4f378b",
        "primary-container": "#eaddff",
        "on-primary-container": "#21005d",
        surface: "#fdf8f6",
        "surface-variant": "#f3edf7",
        "surface-container": "#e8def8",
        "on-surface": "#1d1b20",
        "on-surface-variant": "#49454f",
        outline: "#79747e",
        "outline-variant": "#e0e0e0",
        "security-blue": "#d3e3fd",
        "security-blue-text": "#001d35",
      },
      fontFamily: {
        sans: ['"Google Sans"', 'Roboto', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
