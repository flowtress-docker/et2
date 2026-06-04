#!/usr/bin/env node
/**
 * Generate architecture/index.html and gallery.html for local diagram viewing.
 * Usage: node scripts/generate-architecture-index.mjs [architecture-dir] [app-base-url]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const archDir = process.argv[2] ?? join(process.cwd(), 'architecture');
const appBase = (process.argv[3] ?? 'http://localhost:5173').replace(/\/+$/, '');
const raw = JSON.parse(readFileSync(join(archDir, 'viewer-urls.json'), 'utf8'));

/** Rewrite viewer host so links work locally without editing viewer-urls.json. */
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

const displayOrder = [
  'et2-system-layers',
  'et2-install-flow',
  'et2-create-simulation',
  'et2-live-session',
  'et2-session-end',
  'et2-anti-patterns',
];

function viewerIframeSrc(viewerUrl) {
  const sep = viewerUrl.includes('?') ? '&' : '?';
  return `${viewerUrl}${sep}size=card`;
}

const listItems = displayOrder
  .filter((key) => urls[key])
  .map((key) => {
    const { viewerUrl, file } = urls[key];
    const title = titles[key] ?? key;
    return `    <li><a href="${viewerUrl}" target="_blank" rel="noopener">${title}</a> <span class="meta">(${file})</span></li>`;
  })
  .join('\n');

const galleryCards = displayOrder
  .filter((key) => urls[key])
  .map((key) => {
    const { viewerUrl, file } = urls[key];
    const title = titles[key] ?? key;
    const src = viewerIframeSrc(viewerUrl);
    return `  <section class="card">
    <header>
      <h2><a href="${viewerUrl}" target="_blank" rel="noopener">${title}</a></h2>
      <span class="meta">${file}</span>
    </header>
    <iframe src="${src}" title="${title}" loading="lazy"></iframe>
  </section>`;
  })
  .join('\n');

const sharedCss = `
    :root { font-family: system-ui, sans-serif; line-height: 1.5; color: #e8e8e8; background: #0f0f0f; }
    a { color: #7dd3fc; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code { background: #222; padding: 0.1em 0.35em; border-radius: 4px; font-size: 0.9em; }
    .meta { color: #666; font-size: 0.85rem; }
    .banner {
      background: #1a2332;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 1rem 1.25rem;
      margin-bottom: 1.5rem;
    }
    .banner strong { color: #fbbf24; }
`;

const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="refresh" content="0; url=gallery.html" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>et2 architecture — local</title>
  <style>${sharedCss}
    body { max-width: 42rem; margin: 2rem auto; padding: 0 1rem; }
  </style>
</head>
<body>
  <p>Redirecting to <a href="gallery.html">gallery</a>…</p>
  <p>If you are not redirected, <a href="gallery.html"><strong>open the diagram gallery</strong></a>.</p>
</body>
</html>
`;

const galleryHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>et2 architecture gallery</title>
  <style>${sharedCss}
    body { margin: 0; padding: 1.5rem; }
    h1 { font-size: 1.35rem; font-weight: 600; margin: 0 0 0.5rem; }
    .lead { color: #aaa; max-width: 52rem; margin: 0 0 1rem; }
    .actions { margin-bottom: 1.5rem; }
    .actions a {
      display: inline-block;
      margin-right: 0.75rem;
      padding: 0.45rem 0.9rem;
      border-radius: 6px;
      background: #e95420;
      color: #fff;
      font-weight: 600;
    }
    .actions a.secondary { background: #334155; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 520px), 1fr));
      gap: 1.25rem;
    }
    .card {
      border: 1px solid #333;
      border-radius: 10px;
      overflow: hidden;
      background: #161616;
    }
    .card header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 0.65rem 1rem;
      border-bottom: 1px solid #333;
    }
    .card h2 { font-size: 1rem; margin: 0; font-weight: 600; }
    .card iframe {
      display: block;
      width: 100%;
      height: 380px;
      border: 0;
      background: #f8fafc;
    }
    ul { padding-left: 1.25rem; color: #aaa; }
  </style>
</head>
<body>
  <h1>et2 architecture</h1>
  <p class="lead">
  OpenFlowKit <strong>Home</strong> (<code>${appBase}/#/home</code>) only lists flows you saved in the browser.
  et2 diagrams are not stored there — they load from <code>#/view?flow=…</code> URLs. This page embeds all six.
  </p>
  <div class="banner">
    <strong>Start here.</strong> Run <code>./scripts/serve-openflowkit-local.sh</code> so OpenFlowKit is on port 5173, then keep this gallery open.
  </div>
  <div class="actions">
    <a href="gallery.html">Refresh gallery</a>
    <a class="secondary" href="${urls['et2-system-layers']?.viewerUrl ?? `${appBase}/#/home`}" target="_blank" rel="noopener">Open system layers (full)</a>
    <a class="secondary" href="${appBase}/#/home" target="_blank" rel="noopener">OpenFlowKit home</a>
  </div>
  <div class="grid">
${galleryCards}
  </div>
  <h2 style="margin-top:2rem;font-size:1rem;">All diagrams (new tab)</h2>
  <ul>
${listItems}
  </ul>
  <p class="meta"><a href="../staging/v2/docs/grill-me_sesh/architecture.yaml">architecture.yaml</a> (canonical spec)</p>
</body>
</html>
`;

writeFileSync(join(archDir, 'index.html'), indexHtml);
writeFileSync(join(archDir, 'gallery.html'), galleryHtml);
console.log(`Wrote ${join(archDir, 'index.html')} (redirect → gallery)`);
console.log(`Wrote ${join(archDir, 'gallery.html')} (${displayOrder.filter((k) => urls[k]).length} diagrams)`);
