import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';

export const ENDPOINT = 'https://x.ruv.io/mcp';
export const TOOLS = Object.freeze(['federation_identity', 'federation_sync', 'claims_status']);
export function validateCall(name, args = {}) {
  if (!TOOLS.includes(name)) throw new Error('Tool is not allowed');
  if (!args || typeof args !== 'object' || Array.isArray(args)) throw new Error('Arguments must be an object');
  const allowed = name === 'federation_sync' ? ['limit', 'sinceSeconds'] : [];
  if (Object.keys(args).some(key => !allowed.includes(key))) throw new Error('Unknown argument');
  for (const [key, value] of Object.entries(args)) {
    const maximum = key === 'limit' ? 100 : 604800;
    if (!Number.isInteger(value) || value < 1 || value > maximum) throw new Error(`Invalid ${key}`);
  }
  return { ...args };
}

// Fetch injection is a trusted embedding/test seam, never exposed over MCP or environment.
export class FederationReader {
  #fetch; #active = 0; #timeout; #maxBytes;
  constructor({ fetchImpl = globalThis.fetch, timeoutMs = 10000, maxBytes = 1048576 } = {}) {
    if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30000) throw new Error('Invalid timeout');
    if (!Number.isInteger(maxBytes) || maxBytes < 256 || maxBytes > 1048576) throw new Error('Invalid byte limit');
    this.#fetch = fetchImpl; this.#timeout = timeoutMs; this.#maxBytes = maxBytes;
  }
  async call(name, args = {}) {
    args = validateCall(name, args);
    if (this.#active >= 4) throw new Error('Concurrency limit reached');
    this.#active++;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new Error('Federation request timed out')), this.#timeout);
    const boundedFetch = async (url, init = {}) => {
      if (String(url) !== ENDPOINT) throw new Error('Endpoint denied');
      // No background subscription or resumable streams in this snapshot reader.
      if (init.method === 'GET') return new Response(null, { status: 405 });
      if (init.method !== 'POST') throw new Error('HTTP method denied');
      const headers = new Headers(init.headers);
      if (headers.has('authorization') || headers.has('cookie')) throw new Error('Credentials denied');
      const response = await this.#fetch(url, {
        ...init, headers, credentials: 'omit', redirect: 'error',
        signal: AbortSignal.any([controller.signal, ...(init.signal ? [init.signal] : [])])
      });
      if (response.status >= 300 && response.status < 400) throw new Error('Redirect denied');
      if (Number(response.headers.get('content-length')) > this.#maxBytes) {
        await response.body?.cancel(); throw new Error('Response exceeds byte limit');
      }
      if (!response.body) return response;
      const reader = response.body.getReader(); let bytes = 0; let finished = false;
      let onAbort;
      const cleanup = () => controller.signal.removeEventListener('abort', onAbort);
      const body = new ReadableStream({
        start(stream) {
          onAbort = () => {
            if (finished) return;
            finished = true; cleanup(); stream.error(controller.signal.reason);
            void reader.cancel().catch(() => {});
          };
          if (controller.signal.aborted) onAbort();
          else controller.signal.addEventListener('abort', onAbort, { once: true });
        },
        async pull(stream) {
          try {
            const next = await reader.read();
            if (finished) return;
            if (next.done) { finished = true; cleanup(); stream.close(); return; }
            bytes += next.value.byteLength;
            if (bytes > thisLimit) throw new Error('Response exceeds byte limit');
            stream.enqueue(next.value);
          } catch (error) {
            if (finished) return;
            finished = true; cleanup(); stream.error(error); void reader.cancel().catch(() => {});
          }
        },
        async cancel() { finished = true; cleanup(); await reader.cancel(); }
      }, { highWaterMark: 0 });
      const thisLimit = this.#maxBytes;
      return new Response(body, { status: response.status, headers: response.headers });
    };
    const client = new Client({ name: 'ruvnet-federation-reader', version: '0.1.0' }, { capabilities: {} });
    const transport = new StreamableHTTPClientTransport(new URL(ENDPOINT), {
      fetch: boundedFetch,
      reconnectionOptions: { maxRetries: 0, initialReconnectionDelay: 1000, maxReconnectionDelay: 1000, reconnectionDelayGrowFactor: 1 }
    });
    try {
      await client.connect(transport, { timeout: this.#timeout });
      const result = await client.callTool({ name, arguments: args }, { timeout: this.#timeout, signal: controller.signal });
      return { provenance: 'gateway-observation', source: ENDPOINT, tool: name,
        observedAt: new Date().toISOString(), trustedForExecution: false, independentlyVerified: false, result };
    } finally {
      clearTimeout(timer); controller.abort(); await client.close().catch(() => {}); this.#active--;
    }
  }
}
