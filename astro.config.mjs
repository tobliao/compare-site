import { defineConfig } from "astro/config";

export default defineConfig({
  site: process.env.SITE_URL ?? "https://tobliao.github.io",
  base: process.env.BASE_PATH ?? "/",
  output: "static",
});
