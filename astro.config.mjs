// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const isProd = process.env.NODE_ENV === 'production';
const base = process.env.BASE_URL || (isProd ? '/dlr-template-catalogo-burguer-express/' : '/');

export default defineConfig({
  site: 'https://dariolanfranco.github.io',
  base,
  integrations: [sitemap()],
});
