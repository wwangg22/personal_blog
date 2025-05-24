import type { Config } from "tailwindcss";

const config: Config = {
  important: false,
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  safelist: [
    "w-screen",
    "w-[full]",
    "w-auto",
    "h-screen",
    "bg-gray-500",
    "bg-gray-600",
    "bg-gray-700",
    "bg-opacity-50",
    "bg-opacity-90",
    "bg-opacity-70",
    "mx-5",
    "lg:mx-0",
    "left-0",
    "lg:left-0",
    "right-0",
    "lg:right-0",
    "right-5",
    "lg:right-5",
    "left-5",
    "lg:left-5",
    "right-10",
    "left-10",
    "lg:left-10",
    "lg:right-10",
    "bottom-10",
    "top-10",
    "right-1/2",
    "left-1/2",
    "top-1/2",
    "lg:top-1/2",
    "bottom-1/2",
    "right-1/4",
    "left-1/4",
    "top-1/4",
    "top-3/4",
    "transform", 
    "-translate-x-1/2",
    "-translate-y-1/2",
    "cursor-pointer", // Pointer cursor for interactions
    "cursor-text", // Text cursor for text input areas
    "outline-none", // Remove default outline
    "transition-all", // Transition for all properties
    "p-4",
    // "text-white",
    "text-info_lg", // Custom class, ensure this exists in your Tailwind config
    "font-bold",
    "py-5",
    "text-2xl",
    "font-serif",
    "absolute", // Already added, no need to add again
    "top-0",
    "left-0",
    "lg:w-1/2",
    "lg:h-1/2",
    "lg:w-1/4",
    "lg:h-1/4",
    "md:w-1/2",
    "md:h-1/2",
    "md:w-1/4",
    "md:h-1/4",
    "sm:w-1/2",
    "sm:h-1/2",
    "sm:w-1/4",
    "sm:h-1/4",
    "sm:w-screen",
    "sm:h-screen",
    "sm:w-full",
    "sm:h-full",
    "sm:left-5",
    "sm:w-full",
    "w-full",
    "h-full",
    "w-1/2",
    "h-1/2",
    "w-1/4",
    "h-1/4",
    "lg:text-info_lg",
    "lg:text-2xl",
   
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
        'graytrans': '#00000030',
        mellow: {
          50:  '#FFFDF0',
          100: '#FEF9DA',
          200: '#FDF2B3',
          300: '#FBEA8A',
          400: '#F9E264',
          /** main **/
          500: '#F7C948',   // <-- the “just-right” yellow
          600: '#DBAF32',
          700: '#B58E26',
          800: '#8E6F1C',
          900: '#59440E',
        }
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
