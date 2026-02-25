const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ["./index.html", "./blog/**/*.html"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        serif: ['Source Serif 4', ...defaultTheme.fontFamily.serif],
      },
    },
  },
  plugins: [],
};
