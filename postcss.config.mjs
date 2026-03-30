// Додаємо плагін для конвертації px -> vw (fluid viewport units)
// Використовуємо postcss-px-to-viewport-8-plugin (сумісний з PostCSS 8)
const config = {
  plugins: [
    "@tailwindcss/postcss",
    [
      "postcss-px-to-viewport-8-plugin",
      {
        viewportWidth: 1440, // базова ширина макета
        unitPrecision: 5,
        viewportUnit: "vw",
        selectorBlackList: ["ignore-vw"], // додайте клас, щоб вимкнути конвертацію
        minPixelValue: 2,
        mediaQuery: false,
      },
    ],
  ],
};

export default config;
