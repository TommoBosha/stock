/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#546A83",
          "secondary": "#D2DBEA",
          "accent": "#18C0C1",
          "neutral": "#3d4451",
          "base-100": "#ffffff",
          ".btn-save": {
            "background-color": "#18C0C1",
            "border-color": "#1EA1F1",
            "border-radius": "0.375rem",
            "padding-right": " 16px",
            "padding-left": " 16px",
            "padding-top": " 4px",
            "padding-bottom": " 4px",
          },
          ".btn-delete": {
            "background-color": "#9f1239",
            "border-color": "#1EA1F1",
            "border-radius": "0.125rem",
            "padding-right": " 16px",
            "padding-left": " 16px",
            "padding-top": " 4px",
            "padding-bottom": " 4px",
            "color": "#fff"
          },
        },
      },
      "dark",
      "cupcake",
    ],
  },

  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      backgroundColor: {
        primary: '#546A83',
        secondary: '#D2DBEA',
        accent: '#18C0C1'
      },
      textColor: {
        primary: '#546A83',
        secondary: '#D2DBEA',
        accent: '#18C0C1'
      }
    },
  },
  plugins: [require("daisyui")],
}
