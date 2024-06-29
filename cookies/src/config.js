import * as url from "url";

const config = {
  APP_NAME: 'coderbackend-app',
  SERVER: "ATLAS_16",
  PORT: 8080,
  DIRNAME: url.fileURLToPath(new URL(".", import.meta.url)),
  // UPLOAD_DIR : "public/img",
  get UPLOAD_DIR() {
    return `${this.DIRNAME}/public/img`;
  },
  MONGODB_URI:
    "mongodb+srv://agusbirn:1234@cluster0.zcj0mx1.mongodb.net/ecommerce",
  MONGODB_ID_REGEX: /^[a-fA-F0-9]{24}$/,
  SECRET: "coder",
  PRODUCTS_PER_PAGE: 5,
  GITHUB_CLIENT_ID: "Iv23li2Gc9N2uCPvIM9z",
  // secret key no deberia estar
  GITHUB_CLIENT_SECRET: "7abd9964ed272bccd1a6d96bfbdaadb6d40b3f81",
  GITHUB_CALLBACK_URL: "http://localhost:8080/api/auth/ghlogincallback",
};

export default config;
