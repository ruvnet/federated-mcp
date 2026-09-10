import { performance } from 'node:perf_hooks';
import { FederationReader } from '../src/gateway.mjs';
import { fixtureFetch } from '../test/fixture.mjs';

const iterations = 100;
async function measure(operation) {
  for (let i = 0; i < 10; i++) await operation();
  const samples = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now(); await operation(); samples.push(performance.now() - start);
  }
  samples.sort((a, b) => a - b);
  return { iterations, p50Ms: samples[49], p95Ms: samples[94], meanMs: samples.reduce((a, b) => a + b) / iterations };
}
const json = new FederationReader(fixtureFetch());
const sse = new FederationReader(fixtureFetch({ sse: true }));
console.log(JSON.stringify({ measuredAt: new Date().toISOString(), node: process.version, platform: process.platform,
  methodology: '10 warmups then 100 sequential calls. In process fetch fixture, no network. Each bridge call includes fresh SDK initialization, notification, tool request, shutdown. Baseline parses one fixture payload only; not an equivalent protocol implementation or SOTA comparison.',
  baselineParse: await measure(async () => JSON.parse('{"content":[{"type":"text","text":"fixture"}]}')),
  sdkJsonLifecycle: await measure(() => json.call('claims_status')),
  sdkSseLifecycle: await measure(() => sse.call('claims_status'))
}, null, 2));
