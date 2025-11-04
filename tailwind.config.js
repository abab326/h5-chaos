/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    spacing: {
      1: "0.26667vw", // 1px → 0.26667vw (基于375设计稿)
      2: "0.53333vw",
      4: "1.06667vw",
      6: "1.6vw",
      8: "2.13333vw",
      12: "3.2vw",
    },
    fontSize: {
      xs: "3.2vw", // 12px → 3.2vw
      sm: "3.73333vw", // 14px → 3.73333vw
      base: "4.26667vw", // 16px → 4.26667vw
      lg: "4.8vw", // 18px → 4.8vw
      xl: "5.33333vw", // 20px → 5.33333vw
      "2xl": "6.4vw", // 24px → 6.4vw
      "3xl": "7.5vw", // 28px → 7.5vw
    },
    extend: {
      colors: {
        cusColor: "red",
      },
    },
  },
  plugins: [],
};
