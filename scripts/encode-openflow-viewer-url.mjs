#!/usr/bin/env node
/**
 * Encode architecture/*.ofk into OpenFlowKit viewer URLs (same algorithm as @openflowkit/mcp-server).
 * Usage: node scripts/encode-openflow-viewer-url.mjs [architecture-dir]
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { deflate } from 'pako';

const APP_BASE = (process.env.OPENFLOWKIT_APP_URL ?? 'https://openflowkit.com').replace(
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

function buildViewerUrl(dsl) {
  return `${APP_BASE}/view?flow=${encodeDslForViewer(dsl)}`;
}

const archDir = process.argv[2] ?? join(process.cwd(), 'architecture');
const files = readdirSync(archDir).filter((f) => f.endsWith('.ofk'));
const out = {};

for (const file of files.sort()) {
  const dsl = readFileSync(join(archDir, file), 'utf8');
  const key = basename(file, '.ofk');
  out[key] = {
    file,
    viewerUrl: buildViewerUrl(dsl),
    editorUrl: `${buildViewerUrl(dsl)}&edit=1`,
  };
}

const jsonPath = join(archDir, 'viewer-urls.json');
writeFileSync(jsonPath, `${JSON.stringify(out, null, 2)}\n`);
console.log(`Wrote ${jsonPath} (${files.length} diagrams)`);
