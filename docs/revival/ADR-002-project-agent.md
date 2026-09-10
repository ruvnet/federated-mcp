# ADR 002: One bounded reader for CLI and MCP

Status: accepted for v2 preview.

Public federation snapshots are useful to agents but do not authorize execution. Five explicit remote read tools are allowlisted. Channel readers accept public channel identifiers only. The local policy resource and validation tools do not accept shell commands, paths or credentials. Validation is operator opt-in with one process slot, sanitized environment and kill deadline. Hash receipts identify output but are unsigned and not independent evidence.

Use the official pinned split MCP SDK 2.0.0. Preserve tested legacy protocol negotiation with the deployed gateway; SDK package version alone does not prove protocol conformance. Retire the historical URL-credential proxy. Fresh connections trade initialization overhead for simpler lifecycle and no background subscription.

Acceptance: actual SDK client subprocess discovery/read/write denial, JSON and SSE fixtures, oversized/stalled streams and bounded CLI tests. Benchmarks report fixture overhead only. Rollback via Git revert restores the old public read interface but must not reenable credential URLs.
