import test from 'node:test';
import assert from 'node:assert/strict';
import { FederationProxy } from '../packages/proxy/federation.ts';

test('retired task workflow cannot report successful federation or retain a secret', async () => {
  const proxy = new FederationProxy('test-only-secret');
  await proxy.removeServer('unknown');
  assert.deepEqual(proxy.getConnectedServers(), []);
  assert.equal(JSON.stringify(proxy).includes('test-only-secret'), false);
  await assert.rejects(proxy.registerServer({serverId: 'task-server', endpoints: {control: 'wss://example.com', data: 'https://example.com'}, auth: {type: 'oauth2', config: {}}}), /retired/);
});
