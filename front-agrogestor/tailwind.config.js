// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2F855A',
        secondary: '#68D391',
        accent: '#ECC94B',
        'bg-main': '#F7FAFC',
        'text-primary': '#2D3748',
        'text-secondary': '#4A5568',
      }
    }
  }
}
