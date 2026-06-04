# PEPÓN — Catálogo Express

Template de catálogo gastronómico express construido con **Astro + Brutalismo Pop**.

## Comandos

| Comando | Acción |
|---------|--------|
| `npm install` | Instala dependencias |
| `npm run dev` | Inicia servidor local en `localhost:4321` |
| `npm run build` | Build de producción en `./dist/` |
| `npm run preview` | Preview del build local |
| `npm run test` | Ejecuta tests con Vitest |
| `npm run typecheck` | Verifica tipos con Astro Check |

## Deploy

| Entorno | Comando |
|---------|---------|
| Raíz (custom domain) | `BASE_URL=/ npm run build` |
| Subpath (GitHub Pages) | `BASE_URL=/nombre-del-repo/ npm run build` |
| Sin `BASE_URL` (default) | `npm run build` → `/dlr-template-catalogo-burguer-express/` |

La variable `BASE_URL` define el path base del sitio. Los scripts de build (precache, manifest, CSP) la usan automáticamente. Sin `BASE_URL`, se usa `/dlr-template-catalogo-burguer-express/`.

## Stack

- **Astro 6** — Framework web
- **TypeScript 6** — Tipado estricto
- **Zod 4** — Validación de esquemas en runtime
- **Vitest 4** — Tests unitarios
- **CSS Custom Properties** — Sistema de tokens y theming dark/light
- **PWA** — Service Worker + precache + manifest
- **CSP** — Content Security Policy con hash injection automático
