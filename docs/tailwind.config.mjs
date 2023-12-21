/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#effbff",
          100: "#dff8fe",
          200: "#c0f0fd",
          300: "#a0e9fd",
          400: "#81e1fc",
          500: "#61dafb",
          600: "#4eaec9",
          700: "#3a8397",
          800: "#275764",
          900: "#132c32",
        },
        secondary: {
          50: "#fff9ec",
          100: "#fff4d9",
          200: "#ffe9b4",
          300: "#ffdd8e",
          400: "#ffd269",
          500: "#ffc743",
          600: "#cc9f36",
          700: "#997728",
          800: "#66501b",
          900: "#33280d",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
