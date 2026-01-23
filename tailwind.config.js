/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: 'tw-',
  content: [
    './layout/*.liquid',
    './sections/*.liquid',
    './snippets/*.liquid',
    './templates/**/*.liquid',
    './templates/**/*.json',
  ],
  theme: {
    extend: {
      colors: {
        // Add custom colors here if needed
      },
      fontFamily: {
        // Add custom fonts here if needed
      },
    },
  },
  plugins: [],
}
