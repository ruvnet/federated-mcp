import { FederationReader } from './gateway.mjs';
import { startStdio } from './server.mjs';
import { policy, runOperation } from './operations.mjs';
const [action = 'help', input = '{}', ...extra] = process.argv.slice(2);
try {
  if (extra.length || Buffer.byteLength(input) > 32768) throw new Error('Invalid CLI input');
  if (action === 'mcp') await startStdio();
  else if (action === 'status') console.log(JSON.stringify(policy));
  else if (action === 'test' || action === 'bench') { process.env.RUV_ALLOW_VALIDATION = '1'; const result = await runOperation(action); console.log(JSON.stringify(result)); if (!result.success) process.exitCode = 1; }
  else if (['identity', 'channels', 'read', 'claims'].includes(action)) console.log(JSON.stringify(await new FederationReader().call({ identity: 'federation_identity', channels: 'channel_list', read: 'channel_sync', claims: 'claims_status' }[action], JSON.parse(input))));
  else if (action === 'help') console.log('Usage: node modern/src/cli.mjs status|identity|channels|read|claims|test|bench|mcp [JSON]');
  else throw new Error('Unknown command');
} catch { console.error('Command rejected or unavailable'); process.exitCode = 1; }
