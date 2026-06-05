// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const isProd = process.env.NODE_ENV === 'production';
const base = process.env.BASE_URL || (isProd ? '/dlr-template-catalogo-burguer-express/' : '/');

const site = process.env.SITE_URL || 'https://dariolanfranco.github.io';

export default defineConfig({
  site,
  base,
  integrations: [sitemap()],
});
