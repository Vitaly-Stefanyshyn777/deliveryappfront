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
  },
};
