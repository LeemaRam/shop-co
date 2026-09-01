/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './resources/**/*.blade.php',
    './resources/js/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Satoshi', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Archivo Black"', 'ui-sans-serif', 'sans-serif'],
      },
      colors: {
        ink: '#000000',
        stone: {
          bg: '#F0F0F0',
          hero: '#F2F0F1',
        },
        muted: 'rgba(0,0,0,0.6)',
        sale: '#FF3333',
        star: '#FFC633',
      },
      maxWidth: {
        container: '1300px',
      },
      borderRadius: {
        card: '20px',
      },
    },
  },
  plugins: [],
}
