# Public RuFlo federation reader

This isolated revival package connects MCP hosts to the public reads at `https://x.ruv.io/mcp`. It exposes only `federation_identity`, `federation_sync`, and `claims_status`. No membership claims, invitations, credentials, remote writes, board posts, or command execution are supported.

## Run and validate

Requires Node 22.16 or newer. Validation was performed on Node 24.19.0.

```sh
cd modern
npm ci --ignore-scripts
npm test
npm audit --omit=dev
npm run bench
node src/server.mjs
```

Configure RuFlo or another MCP host with the absolute local server path:

```json
{
  "mcpServers": {
    "ruvnet-public-federation": {
      "command": "node",
      "args": ["/absolute/path/federated-mcp/modern/src/server.mjs"]
    }
  }
}
```

The process uses stdout exclusively for SDK protocol messages. It requires outbound HTTPS to x.ruv.io. The fixed endpoint cannot be changed through tools, arguments, or environment variables. No automatic remote discovery is used to expand the allowed tools. Local discovery returns a static list.

## Trust and resource invariants

| Boundary | Enforced behavior |
| :--- | :--- |
| Tool dispatch | Unknown tools and unexpected arguments rejected before a network request |
| Sync arguments | Integer limit 1 to 100; lookback 1 to 604800 seconds |
| Credentials | No auth provider; Authorization and Cookie headers denied; fetch credentials omitted |
| Network | Exact HTTPS endpoint; redirects denied; POST only; background GET subscriptions disabled |
| Responses | One MiB per HTTP response, counted while streaming before SDK parsing |
| Deadline | Ten seconds across the complete call, including initialization and response consumption |
| Concurrency | Four calls maximum; excess calls rejected without a queue |
| Stdio | SDK input buffer limited to 64 KiB |
| Provenance | Outer envelope always gateway observation; independent verification and execution authority always false |
| Cleanup | Every call closes its SDK client; persistent SSE body cancelled after the result |

Remote content remains nested in `result`. A message claiming `trustedForExecution: true` cannot change the wrapper. A gateway observation is not a verified Nostr event. Signed membership, replay protection, authenticated publishing, AgentBBS bridging, and execution policy require separate implementations and are intentionally not implied by this reader.

A fresh MCP session per read avoids sharing server session state between requests. It costs initialization and notification traffic on each call. There are no automatic retries or background subscriptions. This package is a bounded snapshot reader, not a production federation scheduler or an SOTA performance claim.

## Dependency and protocol evidence

Both `@modelcontextprotocol/client` and `@modelcontextprotocol/server` are pinned to registry version `2.0.0`, with transitive integrity recorded in `package-lock.json`. The official SDK repository identifies the split v2 packages as its stable release line for the 2026-07-28 specification. Source: <https://github.com/modelcontextprotocol/typescript-sdk> and <https://modelcontextprotocol.io/specification/2026-07-28>.

This client uses the SDK default legacy negotiation path to interoperate with the existing gateway; fixtures negotiate `2025-03-26`. The stdio server uses the official SDK lifecycle. Installing SDK v2 does not assert that the remote gateway supports the new protocol revision. Source declarations in the installed SDK explicitly document the default legacy mode.

## Evidence and limitations

A live identity read through this SDK client from the validation runtime reached the configured ten second timeout. The live SDK gateway path remains unverified; successful reads through a separate federation plugin do not establish this client path. No live member publication was attempted.

Ten tests cover JSON and SSE lifecycle, continuous SSE completion without waiting for EOF, timeouts and cancellation, frame and response limits, concurrent admission, argument and write denial, trust metadata isolation, and an actual subprocess stdio invocation. Tests inject an in process HTTP fixture; they neither publish to the federation nor claim live membership interoperability.

`bench/results.json` records 100 measured calls after ten warmups per transport. This is local adapter overhead, without network latency. The parse baseline is explicitly not an equivalent protocol implementation. `bench/audit.json` records the dependency audit at validation time; rerun it before deployment because advisories change.

Acceptance: `npm test` passes and an unknown tool produces an error without contacting a remote endpoint. Live public read verification can be performed by an MCP host after configuration; live results remain observations.
