// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],

  // ✅ Set DaisyUI theme
  daisyui: {
    themes: ["dark"], // ← only enable the dark theme
  }
}
