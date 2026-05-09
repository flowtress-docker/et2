const { spawn } = require('child_process');

const server = spawn('npx', ['-y', '@upstash/context7-mcp@latest'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: '/Users/lab/projects/et2',
  env: { ...process.env, PATH: process.env.PATH }
});

let buffer = '';
const pending = new Map();
let nextId = 1;

function send(msg) {
  const line = JSON.stringify(msg);
  console.error('->', line.slice(0, 400));
  server.stdin.write(line + '\n');
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
  let lines = buffer.split('\n');
  buffer = lines.pop();
  for (const line of lines) {
    if (!line.trim()) continue;
    console.error('<-', line.slice(0, 400));
    try {
      const msg = JSON.parse(line);
      if (msg.id !== undefined && pending.has(msg.id)) {
        const p = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) p.reject(msg.error);
        else p.resolve(msg.result);
      }
    } catch (e) {
      console.error('parse error', e);
    }
  }
});

server.stderr.on('data', (data) => {
  // server logs; ignore to avoid noise
});

async function main() {
  // initialize
  const initId = nextId++;
  const initPromise = new Promise((resolve, reject) => {
    pending.set(initId, { resolve, reject });
    send({ jsonrpc: '2.0', id: initId, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'research-agent', version: '1.0.0' } } });
  });
  await initPromise;
  send({ jsonrpc: '2.0', method: 'notifications/initialized' });

  const libraries = [
    { name: 'KiCad', query: 'how to create circuits programmatically' },
    { name: 'PySpice', query: 'SPICE simulation python wrapper' },
    { name: 'skidl', query: 'python API for circuit netlist generation' },
    { name: 'lcapy', query: 'python API for circuit netlist generation' },
    { name: 'Qucs', query: 'how to run simulation from command line' },
    { name: 'ngspice', query: 'SPICE simulation python wrapper' },
    { name: 'Xyce', query: 'how to run simulation from command line' },
    { name: 'LTspice', query: 'how to run simulation from command line' }
  ];

  const resolved = [];
  for (const lib of libraries) {
    try {
      const result = await call('resolve-library-id', { libraryName: lib.name, query: lib.query });
      resolved.push({ library: lib.name, result });
    } catch (err) {
      resolved.push({ library: lib.name, error: err });
    }
  }

  const queries = [
    'how to create circuits programmatically',
    'how to run simulation from command line',
    'python API for circuit netlist generation',
    'SPICE simulation python wrapper',
    'how to export circuit to schematic or PCB'
  ];

  const docsResults = [];
  for (const item of resolved) {
    if (item.error || !item.result || !item.result.content) {
      docsResults.push({ library: item.library, skipped: true, reason: 'No result' });
      continue;
    }
    // Parse content text to extract libraryId
    const content = item.result.content;
    let libId = null;
    if (Array.isArray(content)) {
      for (const c of content) {
        if (c.type === 'text') {
          // Try to extract /org/project pattern
          const m = c.text.match(/(\/[^\s]+\/[^\s]+(?:\/[^\s]+)?)/);
          if (m) {
            libId = m[1];
            break;
          }
        }
      }
    }
    if (!libId) {
      docsResults.push({ library: item.library, skipped: true, reason: 'Could not extract libraryId' });
      continue;
    }
    for (const q of queries) {
      try {
        const result = await call('query-docs', { libraryId: libId, query: q });
        docsResults.push({ library: item.library, libraryId: libId, query: q, result });
      } catch (err) {
        docsResults.push({ library: item.library, libraryId: libId, query: q, error: err });
      }
    }
  }

  console.log(JSON.stringify({ resolved, docsResults }, null, 2));
  server.kill();
  process.exit(0);
}

main().catch((err) => {
  console.error('Main error', err);
  server.kill();
  process.exit(1);
});
