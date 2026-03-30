export default {
  plugins: {
    "@tailwindcss/postcss": {},
    "postcss-functions": {
      functions: {
        // Використовуємо тільки для мобільних стилів
        vw: (value) => {
          const px = parseFloat(String(value));
          if (Number.isNaN(px)) return String(value);
          return `${(px / 375) * 100}vw`;
        },
      },
    },
    "postcss-px-to-viewport-8-media-screen": {
      unitToConvert: "px",
      viewportWidth: 1920, // база = десктоп
      unitPrecision: 5,
      propList: ["*"],
      viewportUnit: "vw",
      fontViewportUnit: "vw",
      selectorBlackList: [".no-vw"],
      minPixelValue: 1,
      mediaQuery: true,
      replace: true,
      exclude: [/node_modules/],
      include: [/(src|app|styles)/],
      mediaScreen: {
        "(max-width: 1024px)": 375,
        "(max-width: 480px)": 375,
        "(max-width: 430px)": 375,
        "screen and (max-width: 430px)": 375,
      },
    },
  },
};
