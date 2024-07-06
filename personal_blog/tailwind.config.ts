import type { Config } from "tailwindcss";

const config: Config = {
  important: true,
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
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
      },
    },
  },
  plugins: [],
};
export default config;
