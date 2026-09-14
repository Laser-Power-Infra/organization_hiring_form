/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cu: {
          navy: '#0F2C59',
          darkNavy: '#071952',
          gold: '#C5A880',
          accent: '#1D5D9B',
          lightBg: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
        },
      },
    },
  },
  plugins: [],
};
