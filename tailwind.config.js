/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        deep: '#030010',
        deep2: '#07001F',
        gold: '#FFD700',
        gold2: '#FFA500',
        gold3: '#FF8C00',
        cyan: '#00FFFF',
        green: '#00FF88',
        green2: '#00CC66',
        pink: '#FF2D78',
        purple: '#B44FFF',
        blue: '#1E90FF',
        silver: '#C8D6E5',
        silver2: '#8395A7',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'monospace'],
        chakra: ['Chakra Petch', 'sans-serif'],
        russo: ['Russo One', 'sans-serif'],
        ui: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
