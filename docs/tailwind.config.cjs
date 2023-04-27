/** @type {import('tailwindcss').Config} */
module.exports = {
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
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
