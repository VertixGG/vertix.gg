const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      'sans': ['Red Hat Display', 'Tahoma', 'sans-serif'],
      'serif': ['El Messiri', 'sans-serif'],
      'mono': ['monospace'],
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.gray,
      blue: {
        'light': '#a9d7ff',
        'DEFAULT': '#78bbff',
        'dark': '#4d90d8',
      },
    },
    screens: {
      'xs': '475px',
      'screen-sm': '640px',
      'screen-md': '768px',
      'screen-lg': '1024px',
      'screen-xl': '1280px',
      'screen-2xl': '1536px',
      'xxl': '1920px',
    },
    extend: {
      backgroundImage: {
        'vertix-main': "url('/bg2.webp'), url('/bg1.webp')",
        'vertix-main-mobile': "url('/bg2.webp')",
        'wings': "url('/wings.png')",
      },
    },
  },
  plugins: [],
}
