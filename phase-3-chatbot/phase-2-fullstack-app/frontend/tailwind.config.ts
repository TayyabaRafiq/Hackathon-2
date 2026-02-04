import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Using Tailwind's built-in blue and neutral palettes
        // No custom colors needed - using blue-600 as primary accent
      },
    },
  },
  plugins: [],
};

export default config;
