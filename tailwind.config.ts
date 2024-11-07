import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          600: "#2F302F",
          700: "#272829",
          800: "#202222",
          900: "#191A1A"
        }
      },
    },
  },
  plugins: [],
};
export default config;
