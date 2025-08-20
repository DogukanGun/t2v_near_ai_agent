/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './app/**/*.{js,ts,jsx,tsx,mdx}',
      './app/components/**/*.{js,ts,jsx,tsx,mdx}',
      './app/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {},
    },
    plugins: [require("daisyui")],
    daisyui: {
      themes: [{
        light: {
          "primary": "#4F46E5",  // Indigo-600
          "primary-content": "#ffffff",
          "secondary": "#7C3AED", // Violet-600
          "secondary-content": "#ffffff",
          "accent": "#37cdbe",
          "accent-content": "#ffffff",
          "neutral": "#3d4451",
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#f2f2f2",
          "base-300": "#e5e6e6",
          "base-content": "#000000"
        }
      }],
      darkTheme: "dark",
      base: true,
      styled: true,
      utils: true,
      prefix: "",
      logs: true,
      themeRoot: ":root",
    },
  }