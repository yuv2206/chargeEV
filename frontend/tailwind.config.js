/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3ddc84',
        accent: '#6af0a6',
        surface: '#0f172a',
        panel: '#111827',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(61,220,132,0.15), 0 20px 45px rgba(15,23,42,0.35)',
      },
      backgroundImage: {
        hero: 'radial-gradient(circle at top left, rgba(61,220,132,0.2), transparent 35%), radial-gradient(circle at 80% 10%, rgba(34,197,94,0.16), transparent 25%), linear-gradient(160deg, #020617 0%, #08111f 45%, #030712 100%)',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
