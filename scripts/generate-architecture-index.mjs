#!/usr/bin/env node
/**
 * Generate architecture/index.html — localhost landing page for et2 diagrams.
 * Usage: node scripts/generate-architecture-index.mjs [architecture-dir] [app-base-url]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const archDir = process.argv[2] ?? join(process.cwd(), 'architecture');
const appBase = (process.argv[3] ?? 'http://localhost:5173').replace(/\/+$/, '');
const raw = JSON.parse(readFileSync(join(archDir, 'viewer-urls.json'), 'utf8'));
/** Rewrite viewer host so index works for local or cloud without editing viewer-urls.json. */
const urls = Object.fromEntries(
  Object.entries(raw).map(([k, v]) => [
    k,
    {
      ...v,
      viewerUrl: v.viewerUrl.replace(/^https?:\/\/[^#]+/, appBase),
    },
  ]),
);

const titles = {
  'et2-system-layers': 'System layers',
  'et2-install-flow': 'Plugin install',
  'et2-create-simulation': 'Create simulation',
  'et2-live-session': 'Live session',
  'et2-session-end': 'Session end',
  'et2-anti-patterns': 'Anti-patterns',
};

const rows = Object.entries(urls)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([key, { viewerUrl, file }]) => {
    const title = titles[key] ?? key;
    return `    <li><a href="${viewerUrl}">${title}</a> <span class="meta">(${file})</span></li>`;
  })
  .join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>et2 architecture — local OpenFlowKit</title>
  <style>
    :root { font-family: system-ui, sans-serif; line-height: 1.5; color: #e8e8e8; background: #111; }
    body { max-width: 42rem; margin: 2rem auto; padding: 0 1rem; }
    h1 { font-size: 1.25rem; font-weight: 600; }
    p { color: #aaa; }
    a { color: #7dd3fc; }
    ul { padding-left: 1.25rem; }
    .meta { color: #666; font-size: 0.85rem; }
    code { background: #222; padding: 0.1em 0.35em; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>et2 architecture (local)</h1>
  <p>
    OpenFlowKit at <code>${appBase}</code>.
    <code>app.openflowkit.com/#/home</code> is empty until you create flows in the cloud app;
    these links open diagrams directly via <code>#/view?flow=…</code>.
  </p>
  <ul>
${rows}
  </ul>
  <p><a href="${appBase}/#/home">OpenFlowKit home</a> · <a href="../staging/v2/docs/grill-me_sesh/architecture.yaml">architecture.yaml</a></p>
</body>
</html>
`;

writeFileSync(join(archDir, 'index.html'), html);
console.log(`Wrote ${join(archDir, 'index.html')}`);
