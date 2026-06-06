#!/usr/bin/env node
/**
 * Convert OpenFlow DSL (.ofk) to Mermaid flowchart for fast static rendering.
 */
const NODE_RE = /^\[(\w+)\]\s+([\w.-]+):\s*(.+?)(?:\s*\{[^}]*\})?\s*$/;
const EDGE_RE = /^([\w.-]+)\s*(==>|->)\s*(?:\|([^|]+)\|\s*)?([\w.-]+)\s*$/;

export function ofkToMermaid(dsl) {
  const lines = dsl
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('//'));

  let title = 'diagram';
  let direction = 'TB';
  const nodes = [];
  const edges = [];

  for (const line of lines) {
    if (line.startsWith('flow:')) {
      title = line.slice(5).trim().replace(/^["']|["']$/g, '');
      continue;
    }
    if (line.startsWith('direction:')) {
      const d = line.slice(10).trim().toUpperCase();
      if (['TB', 'BT', 'LR', 'RL'].includes(d)) direction = d;
      continue;
    }

    const nodeMatch = line.match(NODE_RE);
    if (nodeMatch) {
      const [, , id, label] = nodeMatch;
      const safeLabel = label.replace(/"/g, '\\"');
      nodes.push({ id, label: safeLabel });
      continue;
    }

    const edgeMatch = line.match(EDGE_RE);
    if (edgeMatch) {
      const [, from, arrow, edgeLabel, to] = edgeMatch;
      edges.push({
        from,
        to,
        thick: arrow === '==>',
        label: edgeLabel?.trim() ?? null,
      });
    }
  }

  const nodeLines = nodes.map(({ id, label }) => `  ${id}["${label}"]`);
  const edgeLines = edges.map(({ from, to, thick, label }) => {
    const link = thick ? '==>' : '-->';
    return label ? `  ${from} ${link}|${label}| ${to}` : `  ${from} ${link} ${to}`;
  });

  return [
    '%% Generated from .ofk — static Mermaid view (fast, edges render correctly)',
    `%% ${title}`,
    `flowchart ${direction}`,
    ...nodeLines,
    ...edgeLines,
  ].join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { readFileSync } = await import('node:fs');
  const path = process.argv[2];
  if (!path) {
    console.error('Usage: node ofk-to-mermaid.mjs path/to/file.ofk');
    process.exit(1);
  }
  console.log(ofkToMermaid(readFileSync(path, 'utf8')));
}
