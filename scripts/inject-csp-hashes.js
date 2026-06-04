import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "../dist");
const report = [];

if (!existsSync(distDir)) {
  console.error("[csp] dist/ not found — skipping");
  process.exit(0);
}

function walk(dir) {
  const files = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.isFile() && full.endsWith(".html")) files.push(full);
  }
  return files;
}

const htmlFiles = walk(distDir);

if (htmlFiles.length === 0) {
  console.error("[csp] no .html files found in dist/");
  process.exit(1);
}

for (const htmlPath of htmlFiles) {
  const html = readFileSync(htmlPath, "utf-8");

  const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/g;
  const hashes = [];
  let match;

  while ((match = scriptRegex.exec(html)) !== null) {
    const attrs = match[1];
    const code = match[2];

    if (attrs.includes('application/ld+json')) continue;
    if (!code.trim()) continue;

    const hash = createHash("sha256").update(code, "utf-8").digest("base64");
    hashes.push(`'sha256-${hash}'`);
  }

  const hashStr = hashes.length ? " " + hashes.join(" ") : "";
  const cspValue = [
    "default-src 'self'",
    "img-src 'self' data:",
    `script-src 'self'${hashStr}`,
    "style-src 'self' 'unsafe-inline'",
  ].join("; ");

  const metaTag = `<meta http-equiv="Content-Security-Policy" content="${cspValue}">`;

  const existingMetaRegex = /<meta\s+http-equiv="Content-Security-Policy"[^>]*>/;
  let updated;

  if (existingMetaRegex.test(html)) {
    updated = html.replace(existingMetaRegex, metaTag);
  } else {
    updated = html.replace("</head>", `  ${metaTag}\n  </head>`);
  }

  writeFileSync(htmlPath, updated, "utf-8");
  const relPath = relative(distDir, htmlPath);
  const hashCount = hashes.length;
  report.push(`  ${hashCount} script hashes → ${relPath}`);
  console.log(`[csp] ✓ ${hashCount} hashes → ${relPath}`);
}

console.log(`[csp] ✓ CSP injected into ${htmlFiles.length} HTML file(s)`);
