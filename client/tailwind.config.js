const colors = require('tailwindcss/colors');
const { colors: defaultColors } = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'], // renamed from purge to content in v3
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      ...defaultColors,
      teal: colors.teal,
    },
    fontFamily: {
      body: ['Open Sans', 'sans-serif'],
      test: ['Inter', 'sans-serif'],
    },
    extend: {
      backgroundImage: {
        homepage: "url('./images/fuji-5.png')",
      },
    },
  },
  variants: {
    extend: {
      borderWidth: ['hover', 'focus', 'group-hover'],
      display: ['group-hover'],
      margin: ['last'],
      borderRadius: ['last'],
      backgroundColor: ['checked'],
      visibility: ['group-hover'],
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
