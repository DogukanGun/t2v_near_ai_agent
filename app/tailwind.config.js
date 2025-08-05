/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {},
    },
    plugins: [require("daisyui")],
    daisyui: {
      themes: [
        {
          light: {
            "primary": "#570df8",
            "primary-content": "#ffffff",
            "secondary": "#f000b8",
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
        },
        {
          cupcake: {
            "primary": "#65c3c8",
            "primary-content": "#ffffff",
            "secondary": "#ef9fbc",
            "secondary-content": "#ffffff",
            "accent": "#eeaf3a",
            "accent-content": "#ffffff",
            "neutral": "#291334",
            "neutral-content": "#ffffff",
            "base-100": "#faf7f5",
            "base-200": "#efeae6",
            "base-300": "#e7e2df",
            "base-content": "#000000"
          }
        },
      ],
    },
  }