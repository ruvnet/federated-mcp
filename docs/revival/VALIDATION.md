# Revival validation

September 10, 2026, Node 24.19.0, Linux.

1. Two legacy retirement regressions pass. The proxy opens no socket for caller selected targets and retains no shared secret.
2. Ten modern integration tests pass: JSON and SSE lifecycle, local write rejection, input validation, response size bounds, timeout cancellation, concurrency limits, actual SDK stdio subprocess and persistent SSE completion without EOF.
3. Fixture benchmark, 10 warmups then 100 calls: JSON lifecycle p95 0.84 ms; SSE lifecycle p95 1.16 ms. These measurements exclude network latency. The parse only baseline is not an equivalent protocol implementation and does not support a speedup claim.
4. Public federation plugin reads succeeded. A direct live identity call using the new SDK reader reached its configured 10 second timeout in this workspace. Live SDK connectivity remains unverified; run the smoke from the intended deployment network before adoption. The reader returned no fabricated success.
5. RuFlo 3.25.6 swarm initialization and targeted advisory security scan succeeded. The scan reported zero findings for the retired proxy only. Historical applications and dependencies are not qualified by this result.

Commands:

```sh
node --test src/tests/federation.test.ts src/tests/workflow.test.ts
npm ci --ignore-scripts --prefix modern
npm test --prefix modern
npm audit --omit=dev --prefix modern
npm run bench --prefix modern
```

Rollback: revert the isolated modern package and integration documentation. Do not restore the old URL token transport without resolving its security design. Merge and production deployment are outside this change.
