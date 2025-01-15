import type { Config } from "tailwindcss";

const config: Config = {
  important: true,
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        'wide': '900px',
        // => @media (min-width: 640px) { ... }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        'universal-jack': ['"Universal Jack"', 'sans-serif'],
      },
      fontSize: {
        'title_large': '5rem',
        'info_lg': '3rem',
        'vvsml': '1rem',
        'vsml': '1.25rem',
        'sml': '1.5rem',
        '2xl': '1.75rem',
        'title': '2rem',
        'titlexl': '3rem',
      },
      colors:{
        'graytrans': '#00000030'
      },
      width: {
        'menu': 'max(20%, 250px)',
        'menuitem' : 'max(75%, 100px)',
        'read': 'min(100vw,680px)',
      },
      gridTemplateColumns:{
        '46': '2fr 3fr',
        '37': '3fr 7fr',
      },
      height:{
        '100': '140px',
        'art': '300px',
      },
      spacing:{
        'svg': 'calc(25vw - 64px)',
        'bbl': 'calc(25vw - 175px)'
      },
      gridTemplateRows:{
        '82': '4fr 1fr',
        '91': '9fr 1fr',
        'headers': 'repeat(2,auto)',
        '7': 'repeat(7,1fr)'
      },
      padding:{
        'search': 'calc(10vw + 2rem)',
        'searchright': '4vw'
      }
    },
  },
  plugins: [],
};
export default config;
