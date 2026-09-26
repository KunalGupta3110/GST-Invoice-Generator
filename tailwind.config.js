/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f6f4ef',
        hairline: '#e5e1d8',
        accent: {
          DEFAULT: '#0f6e64',
          dark: '#0b544c',
          light: '#e5f1ef',
        },
        label: '#8b7d6d',
      },
    },
  },
  plugins: [],
}
