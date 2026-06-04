#!/usr/bin/env node
/**
 * Query Context7 for Wokwi / wokwi-cli docs and write context7-wokwi.json.
 * Merge highlights into research/04-context7-findings.md manually or via follow-up script.
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'context7-wokwi.json');

const server = spawn('npx', ['-y', '@upstash/context7-mcp@latest'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: ROOT,
});

let buffer = '';
let nextId = 1;
const pending = new Map();

function send(msg) {
  server.stdin.write(JSON.stringify(msg) + '\n');
}

function call(name, args) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    send({ jsonrpc: '2.0', id, method: 'tools/call', params: { name, arguments: args } });
  });
}

server.stdout.on('data', (data) => {
  buffer += data.toString();
  const lines = buffer.split('\n');
  buffer = lines.pop();
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const msg = JSON.parse(line);
      if (msg.id !== undefined && pending.has(msg.id)) {
        const p = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) p.reject(msg.error);
        else p.resolve(msg.result);
      }
    } catch {
      /* ignore parse noise */
    }
  }
});

function extractLibraryId(result) {
  if (!result?.content) return null;
  for (const c of result.content) {
    if (c.type !== 'text') continue;
    const m = c.text.match(/Context7-compatible library ID:\s*(\/[^\s]+)/);
    if (m) return m[1];
  }
  return null;
}

function extractBlocks(result) {
  const blocks = [];
  if (!result?.content) return blocks;
  for (const c of result.content) {
    if (c.type !== 'text') continue;
    for (const block of c.text.split('--------------------------------')) {
      const trimmed = block.trim();
      if (trimmed) blocks.push(trimmed);
    }
  }
  return blocks;
}

function extractCode(block) {
  const m = block.match(/```(?:\w+)?\n([\s\S]*?)```/);
  return m ? m[1].trim() : null;
}

function extractSource(block) {
  const m = block.match(/Source:\s*(\S+)/);
  return m ? m[1] : '';
}

async function main() {
  const initId = nextId++;
  await new Promise((resolve, reject) => {
    pending.set(initId, { resolve, reject });
    send({
      jsonrpc: '2.0',
      id: initId,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'et2-context-gen', version: '1.0.0' },
      },
    });
  });
  send({ jsonrpc: '2.0', method: 'notifications/initialized' });

  const resolved = [];
  for (const libraryName of ['Wokwi', 'wokwi-docs']) {
    try {
      const result = await call('resolve-library-id', {
        libraryName,
        query: 'wokwi cli automation scenarios diagram.json',
      });
      resolved.push({ libraryName, result, libraryId: extractLibraryId(result) });
    } catch (error) {
      resolved.push({ libraryName, error });
    }
  }

  const libId =
    resolved.find((r) => r.libraryId)?.libraryId || '/wokwi/wokwi-docs';

  const queries = [
    'automation scenarios yaml',
    'wokwi-cli getting started',
    'diagram.json parts',
    'platformio build integration',
    'set-control wait-serial',
  ];

  const docs = [];
  for (const query of queries) {
    try {
      const result = await call('query-docs', { libraryId: libId, query });
      docs.push({ libraryId: libId, query, result });
    } catch (error) {
      docs.push({ libraryId: libId, query, error });
    }
  }

  fs.writeFileSync(OUT, JSON.stringify({ resolved, docs }, null, 2));

  const mdPath = path.join(ROOT, 'research/04-context7-findings.md');
  let existing = '';
  if (fs.existsSync(mdPath)) {
    existing = fs.readFileSync(mdPath, 'utf8');
    const marker = '## EDA / SPICE (legacy research)';
    if (!existing.includes(marker)) {
      existing = existing.replace(
        '# Context7 Research Findings',
        '# Context7 Research Findings\n\n## Wokwi (primary — et2 demos)\n\n'
      );
    }
  }

  const wokwiSections = ['## Wokwi (primary — et2 demos)\n'];
  wokwiSections.push(`- **Context7 library ID**: \`${libId}\`\n`);

  const seen = new Set();
  for (const { query, result } of docs) {
    if (!result) continue;
    for (const block of extractBlocks(result)) {
      const code = extractCode(block);
      if (!code || seen.has(code)) continue;
      seen.add(code);
      const source = extractSource(block);
      wokwiSections.push(`### Query: *${query}*\n`);
      if (source) wokwiSections.push(`- **Source**: ${source}\n`);
      wokwiSections.push('```\n' + code + '\n```\n');
      if (seen.size >= 8) break;
    }
    if (seen.size >= 8) break;
  }

  const wokwiPart = wokwiSections.join('\n');
  let merged;
  if (existing.includes('## Wokwi (primary')) {
    merged = existing.replace(
      /## Wokwi \(primary[\s\S]*?(?=\n## |\n# |\z)/,
      wokwiPart.trim() + '\n\n'
    );
  } else {
    merged =
      '# Context7 Research Findings\n\n' +
      wokwiPart +
      '\n## EDA / SPICE (legacy research)\n\n' +
      existing.replace(/^# Context7 Research Findings\s*/i, '');
  }

  fs.writeFileSync(mdPath, merged);
  console.log('Wrote', OUT, 'and updated', mdPath);
  server.kill();
}

main().catch((err) => {
  console.error(err);
  server.kill();
  process.exit(1);
});
