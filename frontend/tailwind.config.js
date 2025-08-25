/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        light: 'var(--color-light)',
        white: 'var(--color-white)',
      },
      backgroundColor: {
        'primary': 'var(--color-primary)',
        'secondary': 'var(--color-secondary)',
        'light': 'var(--color-light)',
        'white': 'var(--color-white)',
      },
      textColor: {
        'primary': 'var(--color-primary)',
        'secondary': 'var(--color-secondary)',
        'light': 'var(--color-light)',
        'white': 'var(--color-white)',
      },
      borderColor: {
        'primary': 'var(--color-primary)',
        'secondary': 'var(--color-secondary)',
        'light': 'var(--color-light)',
        'white': 'var(--color-white)',
      }
    },
  },
  plugins: [],
}
