const colors = require('tailwindcss/colors');
const { colors: defaultColors } = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'], // renamed from purge to content in v3
  darkMode: false, // or 'media' or 'class'
  theme: {
  extend: {
    colors: {
      teal: colors.teal, // this adds teal, but keeps bg-gray-300, text-red-500, etc.
    },
    backgroundImage: {
      homepage: "url('./images/fuji-5.png')",
    },
  },
  fontFamily: {
    body: ['Open Sans', 'sans-serif'],
    test: ['Inter', 'sans-serif'],
  },
}
,
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
