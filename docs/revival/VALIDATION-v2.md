# Validation evidence

Node v24.19.0, Linux. `npm test`: 2 legacy retirement regressions and 13 modern tests pass. These include actual SDK stdio subprocess calls, JSON and persistent SSE, response caps, stalled body cancellation, concurrency release, private channel rejection and CLI subprocess validation. `npm run bench --prefix modern`: 10 warmups and 100 measured fixture calls; p95 JSON 0.884 ms, SSE 0.961 ms. These are in-process transport fixtures, not internet latency or a SOTA comparison.

The connected live gateway identity read succeeded independently. CLI live network checks are recorded separately from fixture evidence. No public messages, invites or privileged remote effects are part of validation. Field memory and deployment require operator configuration; unsigned receipts cannot attest external execution.
