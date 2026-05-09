const { spawn } = require('child_process');

const server = spawn('npx', ['-y', '@upstash/context7-mcp@latest'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: '/Users/lab/projects/et2'
});

let buffer = '';
const pending = new Map();
let nextId = 1;

function send(msg) {
  const line = JSON.stringify(msg);
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
    try {
      const msg = JSON.parse(line);
      if (msg.id !== undefined && pending.has(msg.id)) {
        const p = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) p.reject(msg.error);
        else p.resolve(msg.result);
      }
    } catch (e) {}
  }
});

async function main() {
  const initId = nextId++;
  const initPromise = new Promise((resolve, reject) => {
    pending.set(initId, { resolve, reject });
    send({ jsonrpc: '2.0', id: initId, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'test', version: '1.0.0' } } });
  });
  await initPromise;
  send({ jsonrpc: '2.0', method: 'notifications/initialized' });

  const r = await call('resolve-library-id', { libraryName: 'CircuitLab', query: 'how to create circuits programmatically' });
  console.log(JSON.stringify(r, null, 2));
  server.kill();
  process.exit(0);
}
main().catch(err => { console.error(err); server.kill(); process.exit(1); });
