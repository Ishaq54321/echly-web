export default {
  plugins: {
    "@tailwindcss/postcss": {
      base: "./annote-extension",
      optimize: { minify: true },
    },
  },
};
