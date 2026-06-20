/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0B2540',
          600: '#092038',
          700: '#07182a',
        },
        fact: {
          green: '#16A34A',
          amber: '#F59E0B',
          red: '#C1121F'
        }
      },
      backgroundColor: {
        page: '#ffffff',
      },
    },
  },
  plugins: [],
};
