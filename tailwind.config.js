// tailwind.config.js
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      screens: {
        xs: "560px",
        xxs: "480px"
      },
      fontFamily: {
        "geist-bold": ["var(--font-geist-bold)"],
        "geist-semi-bold": ["var(--font-geist-semi-bold)"],
        "geist-regular": ["var(--font-geist-regular)"],
        "gloock-regular": ["var(--font-gloock-regular)"]
      }
    }
  }
};
