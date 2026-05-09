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
  console.error('->', line);
  server.stdin.write(line + '\n');
}

function req(method, params) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    send({ jsonrpc: '2.0', id, method, params });
  });
}

server.stdout.on('data', (data) => {
  buffer += data.toString();
  let lines = buffer.split('\n');
  buffer = lines.pop();
  for (const line of lines) {
    if (!line.trim()) continue;
    console.error('<-', line);
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
  await req('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'test', version: '1.0.0' } });
  send({ jsonrpc: '2.0', method: 'notifications/initialized' });
  const tools = await req('tools/list', {});
  console.log(JSON.stringify(tools, null, 2));
  server.kill();
  process.exit(0);
}
main().catch(err => { console.error(err); server.kill(); process.exit(1); });
