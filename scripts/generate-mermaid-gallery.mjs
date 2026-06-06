#!/usr/bin/env node
/**
 * Build architecture/gallery-mermaid.html — fast static diagrams (no OpenFlowKit).
 * Usage: node scripts/generate-mermaid-gallery.mjs [architecture-dir]
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { ofkToMermaid } from './ofk-to-mermaid.mjs';

const archDir = process.argv[2] ?? join(process.cwd(), 'architecture');
const mermaidDir = join(archDir, 'diagrams');
mkdirSync(mermaidDir, { recursive: true });

const titles = {
  'et2-system-layers': 'System layers',
  'et2-install-flow': 'Plugin install',
  'et2-create-simulation': 'Create simulation',
  'et2-live-session': 'Live session',
  'et2-session-end': 'Session end',
  'et2-anti-patterns': 'Anti-patterns',
};

const order = [
  'et2-system-layers',
  'et2-install-flow',
  'et2-create-simulation',
  'et2-live-session',
  'et2-session-end',
  'et2-anti-patterns',
];

const diagrams = [];
for (const file of readdirSync(archDir).filter((f) => f.endsWith('.ofk')).sort()) {
  const key = basename(file, '.ofk');
  const dsl = readFileSync(join(archDir, file), 'utf8');
  const mermaid = ofkToMermaid(dsl);
  writeFileSync(join(mermaidDir, `${key}.mmd`), `${mermaid}\n`);
  diagrams.push({ key, file, title: titles[key] ?? key, mermaid });
}

diagrams.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));

const sections = diagrams
  .map(
    ({ key, file, title, mermaid }) => `  <section class="card" id="${key}">
    <header><h2>${title}</h2><span class="meta">${file}</span></header>
    <pre class="mermaid">${mermaid}</pre>
  </section>`,
  )
  .join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>et2 architecture</title>
  <style>
    :root { font-family: system-ui, sans-serif; line-height: 1.5; color: #e8e8e8; background: #0f0f0f; }
    body { margin: 0; padding: 1.5rem; max-width: 56rem; }
    h1 { font-size: 1.35rem; margin: 0 0 0.5rem; }
    .lead { color: #aaa; margin-bottom: 1.25rem; }
    .banner { background: #1a2332; border: 1px solid #334155; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; }
    .banner strong { color: #7dd3fc; }
    nav { margin-bottom: 1.5rem; display: flex; flex-wrap: wrap; gap: 0.5rem; }
    nav a { color: #7dd3fc; font-size: 0.9rem; padding: 0.25rem 0.5rem; border: 1px solid #334155; border-radius: 4px; text-decoration: none; }
    .card { border: 1px solid #333; border-radius: 10px; margin-bottom: 1.5rem; overflow: hidden; background: #161616; }
    .card header { display: flex; justify-content: space-between; padding: 0.65rem 1rem; border-bottom: 1px solid #333; }
    .card h2 { font-size: 1rem; margin: 0; }
    .meta { color: #666; font-size: 0.85rem; }
    .mermaid { margin: 0; padding: 1rem; background: #f8fafc; min-height: 120px; }
  </style>
</head>
<body>
  <h1>et2 architecture</h1>
  <p class="lead">Static Mermaid diagrams — instant load, connected edges. Source: <code>architecture/*.ofk</code>.</p>
  <div class="banner">
    <strong>Fast path.</strong> No OpenFlowKit dev server. For editing in OpenFlowKit use <code>./scripts/serve-openflowkit-local.sh</code> (heavy).
  </div>
  <nav>
${diagrams.map((d) => `    <a href="#${d.key}">${d.title}</a>`).join('\n')}
  </nav>
${sections}
  <p class="meta"><a href="../staging/v2/docs/grill-me_sesh/architecture.yaml">architecture.yaml</a></p>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: true, theme: 'neutral', securityLevel: 'loose' });
  </script>
</body>
</html>
`;

writeFileSync(join(archDir, 'gallery-mermaid.html'), html);
writeFileSync(
  join(archDir, 'index.html'),
  `<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=gallery-mermaid.html"><title>et2 architecture</title></head><body><p><a href="gallery-mermaid.html">Open gallery</a></p></body></html>`,
);

console.log(`Wrote ${join(archDir, 'gallery-mermaid.html')} (${diagrams.length} diagrams)`);
console.log(`Wrote ${mermaidDir}/*.mmd`);
