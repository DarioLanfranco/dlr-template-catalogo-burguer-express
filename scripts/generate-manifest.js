import { writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "../dist");
const isProd = process.env.NODE_ENV === 'production';
const base = (process.env.BASE_URL || (isProd ? '/dlr-template-catalogo-burguer-express/' : '/')).replace(/\/?$/, '/');

if (!existsSync(distDir)) {
  throw new Error("[manifest] dist/ not found — run `astro build` first");
}

const manifest = {
  name: "PEPÓN — Catálogo Express",
  short_name: "PEPÓN",
  description:
    "Catálogo express de comidas. Hamburguesas, pizzas, empanadas, papas y más. Sabor que pega fuerte.",
  start_url: base,
  scope: base,
  display: "standalone",
  background_color: "#121212",
  theme_color: "#E63946",
  icons: [
    {
      src: base + "icons/icon-192x192.png",
      sizes: "192x192",
      type: "image/png",
    },
    {
      src: base + "icons/icon-512x512.png",
      sizes: "512x512",
      type: "image/png",
    },
  ],
};

const outputPath = resolve(distDir, "manifest.json");
writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
console.log(`[manifest] ✓ written with base "${base}" → ${outputPath}`);
