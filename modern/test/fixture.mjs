export function fixtureFetch({ sse = false, response = { type: 'StatusUpdate', note: 'fixture' } } = {}) {
  const requests = [];
  const fetchImpl = async (url, options) => {
    requests.push({ url: String(url), ...options });
    const message = JSON.parse(options.body);
    if (!Object.hasOwn(message, 'id')) return new Response(null, { status: 202 });
    const result = message.method === 'initialize'
      ? { protocolVersion: '2025-03-26', capabilities: { tools: {} }, serverInfo: { name: 'fixture', version: '1' } }
      : { content: [{ type: 'text', text: JSON.stringify(response) }] };
    const payload = JSON.stringify({ jsonrpc: '2.0', id: message.id, result });
    return new Response(sse ? `event: message\ndata: ${payload}\n\n` : payload,
      { headers: { 'content-type': sse ? 'text/event-stream' : 'application/json' } });
  };
  return { fetchImpl, requests };
}
