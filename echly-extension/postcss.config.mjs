export default {
  plugins: {
    "@tailwindcss/postcss": {
      base: "./echly-extension",
      optimize: { minify: true },
    },
  },
};
