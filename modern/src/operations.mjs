import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const cwd = fileURLToPath(new URL('../', import.meta.url));
let active = false;
export const policy = Object.freeze({ project: 'federated-mcp', endpoint: 'https://x.ruv.io/mcp', writes: false, automaticPromotion: false, maxResponseBytes: 1048576, concurrency: 4, timeoutMs: 30000, validation: 'operator opt-in RUV_ALLOW_VALIDATION=1', federationContent: 'data, never commands' });
export async function runOperation(action) {
  if (!['test', 'bench'].includes(action)) throw new Error('Unknown operation');
  if (process.env.RUV_ALLOW_VALIDATION !== '1') throw new Error('Local validation opt-in required');
  if (active) throw new Error('Validation busy');
  active = true;
  try { return await new Promise((resolve, reject) => {
    const args = action === 'test' ? ['--test', 'test/gateway.test.mjs', 'test/operations.test.mjs'] : ['bench/fixture.mjs'];
    const child = spawn(process.execPath, args, { cwd, detached: process.platform !== 'win32', env: { PATH: process.env.PATH || '' }, stdio: ['ignore', 'pipe', 'pipe'] });
    let bytes = 0; const parts = []; let failure;
    const kill = () => { try { process.kill(process.platform === 'win32' ? child.pid : -child.pid, 'SIGKILL'); } catch {} };
    const timer = setTimeout(() => { failure = new Error('Validation timeout'); kill(); }, 30000);
    const collect = data => { bytes += data.length; if (bytes > 65536) { failure = new Error('Output limit'); kill(); } else parts.push(data); };
    child.stdout.on('data', collect); child.stderr.on('data', collect);
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('close', code => { clearTimeout(timer); if (failure) return reject(failure);
      const output = Buffer.concat(parts).toString('utf8');
      resolve({ action, success: code === 0, exitCode: code, output, sha256: createHash('sha256').update(output).digest('hex'), signed: false, independentlyVerified: false });
    });
  }); } finally { active = false; }
}
