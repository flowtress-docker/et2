#!/usr/bin/env node
/**
 * Generate architecture/index.html and gallery.html for local diagram viewing.
 * Usage: node scripts/generate-architecture-index.mjs [architecture-dir] [app-base-url] [extra-output-path]
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const archDir = process.argv[2] ?? join(process.cwd(), 'architecture');
const appBase = (process.argv[3] ?? 'http://127.0.0.1:5173').replace(/\/+$/, '');
const extraOutput = process.argv[4] ?? null;
const raw = JSON.parse(readFileSync(join(archDir, 'viewer-urls.json'), 'utf8'));

/**
 * Preserve `/#/view?flow=…` when swapping host.
 * Naive origin replace drops slash before `#` → `host#/view` breaks HashRouter in iframes.
 */
export function rewriteViewerUrl(viewerUrl, base) {
  const origin = base.replace(/\/+$/, '');
  const hashIndex = viewerUrl.indexOf('#');
  if (hashIndex === -1) {
    return viewerUrl;
  }
  return `${origin}/${viewerUrl.slice(hashIndex)}`;
}

const urls = Object.fromEntries(
  Object.entries(raw).map(([k, v]) => [
    k,
    {
      ...v,
      viewerUrl: rewriteViewerUrl(v.viewerUrl, appBase),
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

/** Same-origin gallery: `/#/view?flow=…` (slash before hash required for HashRouter). */
function viewerIframeSrcRelative(viewerUrl) {
  const hashIndex = viewerUrl.indexOf('#');
  if (hashIndex === -1) {
    return viewerIframeSrc(viewerUrl);
  }
  const hash = viewerUrl.slice(hashIndex);
  const sep = hash.includes('?') ? '&' : '?';
  return `/${hash}${sep}size=card`;
}

const listItems = displayOrder
  .filter((key) => urls[key])
  .map((key) => {
    const { viewerUrl, file } = urls[key];
    const title = titles[key] ?? key;
    return `    <li><a href="${viewerUrl}" target="_blank" rel="noopener">${title}</a> <span class="meta">(${file})</span></li>`;
  })
  .join('\n');

function buildGalleryCards(iframeSrcFn, eagerFirst = false) {
  return displayOrder
    .filter((key) => urls[key])
    .map((key, index) => {
      const { viewerUrl, file } = urls[key];
      const title = titles[key] ?? key;
      const src = iframeSrcFn(viewerUrl);
      const loading = eagerFirst && index === 0 ? 'eager' : 'lazy';
      return `  <section class="card" data-diagram="${key}">
    <header>
      <h2><a href="${viewerUrl}" target="_blank" rel="noopener">${title}</a></h2>
      <span class="meta">${file}</span>
    </header>
    <div class="frame-wrap">
      <p class="loading" aria-live="polite">Loading diagram…</p>
      <iframe src="${src}" title="${title}" loading="${loading}"></iframe>
    </div>
  </section>`;
    })
    .join('\n');
}

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

const galleryJs = `
<script>
(function () {
  document.querySelectorAll('.card iframe').forEach(function (frame) {
    var wrap = frame.closest('.frame-wrap');
    var loading = wrap && wrap.querySelector('.loading');
    function done() {
      if (loading) loading.style.display = 'none';
      frame.style.opacity = '1';
    }
    frame.addEventListener('load', done);
    setTimeout(function () {
      if (loading && loading.style.display !== 'none') {
        loading.textContent = 'Still loading — open diagram in new tab if blank persists.';
      }
    }, 12000);
  });
})();
</script>
`;

function buildGalleryHtml({ iframeSrcFn, eagerFirst, archYamlHref }) {
  return `<!DOCTYPE html>
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
    .frame-wrap { position: relative; min-height: 380px; background: #f8fafc; }
    .frame-wrap .loading {
      position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
      margin: 0; color: #64748b; font-size: 0.9rem; background: #f8fafc; z-index: 1;
    }
    .card iframe {
      display: block;
      width: 100%;
      height: 380px;
      border: 0;
      background: #f8fafc;
      opacity: 0;
      transition: opacity 0.25s ease;
      position: relative;
      z-index: 2;
    }
    ul { padding-left: 1.25rem; color: #aaa; }
  </style>
</head>
<body>
  <h1>et2 architecture</h1>
  <p class="lead">
  Diagrams load via <code>/#/view?flow=…</code> (not OpenFlowKit Home). Wait a few seconds per panel, or open a diagram in a new tab.
  </p>
  <div class="banner">
    <strong>Tip:</strong> If panels stay blank, confirm OpenFlowKit is running at <code>${appBase}</code> and URLs use <code>/#/view</code> (slash before hash).
  </div>
  <div class="actions">
    <a href="?">Refresh gallery</a>
    <a class="secondary" href="${urls['et2-system-layers']?.viewerUrl ?? `${appBase}/#/home`}" target="_blank" rel="noopener">Open system layers (full)</a>
    <a class="secondary" href="${appBase}/#/home" target="_blank" rel="noopener">OpenFlowKit home</a>
  </div>
  <div class="grid">
${buildGalleryCards(iframeSrcFn, eagerFirst)}
  </div>
  <h2 style="margin-top:2rem;font-size:1rem;">All diagrams (new tab)</h2>
  <ul>
${listItems}
  </ul>
  ${archYamlHref ? `<p class="meta"><a href="${archYamlHref}">architecture.yaml</a> (canonical spec)</p>` : ''}
${galleryJs}
</body>
</html>
`;
}

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
  <p>Prefer same-origin gallery: <a href="${appBase}/et2-gallery.html"><strong>${appBase}/et2-gallery.html</strong></a></p>
</body>
</html>
`;

const galleryCrossOrigin = buildGalleryHtml({
  iframeSrcFn: viewerIframeSrc,
  eagerFirst: false,
  archYamlHref: '../staging/v2/docs/grill-me_sesh/architecture.yaml',
});

const gallerySameOrigin = buildGalleryHtml({
  iframeSrcFn: viewerIframeSrcRelative,
  eagerFirst: true,
  archYamlHref: null,
});

writeFileSync(join(archDir, 'index.html'), indexHtml);
writeFileSync(join(archDir, 'gallery.html'), galleryCrossOrigin);
console.log(`Wrote ${join(archDir, 'index.html')} (redirect → gallery)`);
console.log(`Wrote ${join(archDir, 'gallery.html')} (${displayOrder.filter((k) => urls[k]).length} diagrams)`);

if (extraOutput) {
  mkdirSync(dirname(extraOutput), { recursive: true });
  writeFileSync(extraOutput, gallerySameOrigin);
  console.log(`Wrote ${extraOutput} (same-origin gallery)`);
}
