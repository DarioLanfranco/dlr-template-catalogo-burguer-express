// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  site: 'https://dariolanfranco.github.io',
  base: isProd ? '/dlr-template-catalogo-burguer-express/' : '/',
  integrations: [sitemap()],
});
