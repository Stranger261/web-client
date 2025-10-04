import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: ['cupcake'], // ✅ keep DaisyUI theme
  },

  // ✅ Add this
  experimental: {
    optimizeUniversalDefaults: true, // forces hex/rgb instead of oklch()
  },
};
