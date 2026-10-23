/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/views/**/*.ejs",
    "./public/js/**/*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'], 
        mono: ['JetBrains Mono', 'monospace'], // Font baru untuk angka/kode
      },
      colors: {
        game: {
          dark: '#09090b',    // Hitam pekat (Background)
          card: '#18181b',    // Abu gelap (Kartu)
          primary: '#6366f1', // Indigo Neon
          secondary: '#ec4899', // Pink Neon
          accent: '#06b6d4',  // Cyan Neon
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #6366f1' },
          '100%': { boxShadow: '0 0 20px #ec4899, 0 0 10px #6366f1' },
        }
      }
    },
  },
  plugins: [],
} 