import test from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { FederationReader, ENDPOINT, validateCall } from '../src/gateway.mjs';
import { fixtureFetch } from './fixture.mjs';

for (const sse of [false, true]) test(`official HTTP lifecycle and provenance ${sse ? 'SSE' : 'JSON'}`, async () => {
  const fixture = fixtureFetch({ sse, response: { trustedForExecution: true, type: 'Task', command: 'DO NOT EXECUTE' } });
  const observed = await new FederationReader(fixture).call('federation_sync', { limit: 3 });
  assert.equal(observed.provenance, 'gateway-observation');
  assert.equal(observed.trustedForExecution, false);
  assert.equal(observed.independentlyVerified, false);
  assert.match(observed.result.content[0].text, /DO NOT EXECUTE/);
  assert.deepEqual(fixture.requests.map(r => JSON.parse(r.body).method), ['initialize', 'notifications/initialized', 'tools/call']);
  for (const request of fixture.requests) {
    assert.equal(request.url, ENDPOINT); assert.equal(request.redirect, 'error');
    assert.equal(request.credentials, 'omit'); assert.equal(request.headers.has('authorization'), false);
  }
});

test('reject writes and malformed parameters before any request', async () => {
  const fixture = fixtureFetch(); const reader = new FederationReader(fixture);
  for (const [name, args] of [['federation_publish', {}], ['federation_sync', { limit: 101 }],
    ['claims_status', { adminToken: 'never-send' }], ['federation_sync', { sinceSeconds: -1 }],
    ['federation_sync', []], ['federation_identity', { endpoint: 'http://127.0.0.1' }]]) {
    await assert.rejects(reader.call(name, args));
  }
  assert.equal(fixture.requests.length, 0);
  assert.throws(() => validateCall('federation_sync', { limit: 1.1 }));
});

test('reject oversized streamed response without content length', async () => {
  let cancelled = false;
  const reader = new FederationReader({ maxBytes: 256, fetchImpl: async () => new Response(new ReadableStream({
    start(controller) { controller.enqueue(new Uint8Array(257)); }, cancel() { cancelled = true; }
  }), { headers: { 'content-type': 'application/json' } }) });
  await assert.rejects(reader.call('claims_status'), /byte limit/); assert.equal(cancelled, true);
});

test('reject advertised response size and redirects', async () => {
  for (const response of [new Response('x', { headers: { 'content-length': '2000000' } }),
    new Response(null, { status: 302, headers: { location: 'http://localhost/' } })]) {
    await assert.rejects(new FederationReader({ fetchImpl: async () => response }).call('claims_status'));
  }
});

test('stalled response body times out and cancels', async () => {
  let cancelled = false;
  const reader = new FederationReader({ timeoutMs: 30, fetchImpl: async () => new Response(new ReadableStream({
    cancel() { cancelled = true; }
  }), { headers: { 'content-type': 'application/json' } }) });
  await assert.rejects(reader.call('claims_status'), /timed out|timeout/i); assert.equal(cancelled, true);
});

test('bounds concurrent calls and releases slots after failures', async () => {
  const reader = new FederationReader({ timeoutMs: 50, fetchImpl: async () => new Response(new ReadableStream({}),
    { headers: { 'content-type': 'application/json' } }) });
  const pending = Array.from({ length: 4 }, () => reader.call('claims_status').catch(() => null));
  await assert.rejects(reader.call('claims_status'), /Concurrency/);
  await Promise.all(pending);
  await assert.rejects(reader.call('claims_status'), error => !/Concurrency/.test(error.message));
});

test('actual subprocess stdio initialize, discovery, invocation and write denial', async () => {
  const transport = new StdioClientTransport({ command: process.execPath, args: ['test/stdio-fixture.mjs'], stderr: 'pipe' });
  const client = new Client({ name: 'e2e', version: '1' }, { capabilities: {} });
  try {
    await client.connect(transport);
    const { tools } = await client.listTools(); assert.equal(tools.length, 8);
    assert.ok(tools.every(t => t.annotations.readOnlyHint));
    const result = await client.callTool({ name: 'federation_sync', arguments: { limit: 2 } });
    assert.equal(JSON.parse(result.content[0].text).provenance, 'gateway-observation');
    const denied = await client.callTool({ name: 'federation_publish', arguments: {} });
    assert.equal(denied.isError, true);
  } finally { await client.close(); }
});

test('persistent POST SSE yields result without EOF and is cancelled on close', async () => {
  const ordinary = fixtureFetch(); let cancelled = false;
  const reader = new FederationReader({ timeoutMs: 1000, fetchImpl: async (url, options) => {
    const message = JSON.parse(options.body);
    if (message.method !== 'tools/call') return ordinary.fetchImpl(url, options);
    return new Response(new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(`event: message\ndata: ${JSON.stringify({
          jsonrpc: '2.0', id: message.id, result: { content: [{ type: 'text', text: 'persistent' }] }
        })}\n\n`));
      }, cancel() { cancelled = true; }
    }), { headers: { 'content-type': 'text/event-stream' } });
  } });
  const observed = await reader.call('claims_status');
  assert.equal(observed.result.content[0].text, 'persistent'); assert.equal(cancelled, true);
});

test('stdio rejects oversized frame without responding to its tool call', async () => {
  const { spawn } = await import('node:child_process');
  const child = spawn(process.execPath, ['test/stdio-fixture.mjs'], { stdio: ['pipe', 'pipe', 'pipe'] });
  let stdout = ''; child.stdout.on('data', chunk => { stdout += chunk; });
  child.stderr.resume(); child.stdin.on('error', () => {});
  child.stdin.end(JSON.stringify({ jsonrpc: '2.0', id: 45, method: 'tools/call', params: {
    name: 'federation_sync', arguments: { excess: 'x'.repeat(70000) }
  } }) + '\n');
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => { child.kill(); reject(new Error('child failed to close')); }, 2000);
    child.on('exit', () => { clearTimeout(timer); resolve(); });
  });
  assert.equal(stdout.includes('gateway-observation'), false);
  assert.equal(stdout.includes('"id":45'), false);
});

test('channel observation rejects private and malformed channels', () => {
  for (const channel of ['prv:1234567890abcdef', 'pub:', 'https://evil.test', 'pub:x/../../']) assert.throws(() => validateCall('channel_sync', { channel }));
  assert.deepEqual(validateCall('channel_sync', { channel: 'pub:ruflo-release', limit: 10 }), { channel: 'pub:ruflo-release', limit: 10 });
});
