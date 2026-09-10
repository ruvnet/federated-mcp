import test from 'node:test';
import assert from 'node:assert/strict';
import { FederationProxy } from '../packages/proxy/federation.ts';

test('legacy registration fails before any socket or credential transmission', async () => {
  const original = globalThis.WebSocket;
  let connections = 0;
  globalThis.WebSocket = class { constructor() { connections++; throw Error('must not connect'); } } as unknown as typeof WebSocket;
  try {
    const proxy = new FederationProxy('test-only-secret');
    for (const control of ['ws://127.0.0.1:3000', 'wss://example.com', 'http://169.254.169.254/latest/meta-data']) {
      await assert.rejects(proxy.registerServer({ serverId: 'test', endpoints: { control, data: control }, auth: { type: 'jwt', config: {} } }), /retired/);
    }
    assert.equal(connections, 0);
    assert.deepEqual(proxy.getConnectedServers(), []);
  } finally { globalThis.WebSocket = original; }
});
