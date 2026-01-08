/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#111827',
          light: '#1f2937',
          dark: '#030712',
        },
        accent: {
          DEFAULT: '#6366f1',
          soft: '#a855f7',
        },
      },
      boxShadow: {
        soft: '0 20px 60px -30px rgba(15, 23, 42, 0.6)',
      },
      backgroundImage: {
        'radial-grid':
          'radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.25) 1px, transparent 0)',
      },
    },
  },
  plugins: [],
};
