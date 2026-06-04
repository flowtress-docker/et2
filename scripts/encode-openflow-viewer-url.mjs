#!/usr/bin/env node
/**
 * Encode architecture/*.ofk into OpenFlowKit viewer URLs (same algorithm as @openflowkit/mcp-server).
 * Usage: node scripts/encode-openflow-viewer-url.mjs [architecture-dir]
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { deflate } from 'pako';

// App is at app.openflowkit.com (HashRouter). openflowkit.com is the marketing landing site only.
const APP_BASE = (process.env.OPENFLOWKIT_APP_URL ?? 'https://app.openflowkit.com').replace(
  /\/+$/,
  '',
);

function encodeDslForViewer(dsl) {
  const compressed = deflate(new TextEncoder().encode(dsl), { level: 9 });
  const b64 = Buffer.from(compressed)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `~${b64}`;
}

/** HashRouter: route is #/view?flow=… (not /view?flow= on the host path). */
function buildViewerUrl(dsl) {
  return `${APP_BASE}/#/view?flow=${encodeDslForViewer(dsl)}`;
}

const archDir = process.argv[2] ?? join(process.cwd(), 'architecture');
const files = readdirSync(archDir).filter((f) => f.endsWith('.ofk'));
const out = {};

for (const file of files.sort()) {
  const dsl = readFileSync(join(archDir, file), 'utf8');
  const key = basename(file, '.ofk');
  const viewerUrl = buildViewerUrl(dsl);
  out[key] = {
    file,
    viewerUrl,
    editorHint: 'Use "Open in Editor" in the viewer toolbar',
  };
}

const jsonPath = join(archDir, 'viewer-urls.json');
writeFileSync(jsonPath, `${JSON.stringify(out, null, 2)}\n`);
console.log(`Wrote ${jsonPath} (${files.length} diagrams)`);
