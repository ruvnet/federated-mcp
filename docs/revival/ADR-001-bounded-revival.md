# ADR 001: Revive a narrow federation boundary before restoring broad execution

Status: Accepted for implementation review, September 10, 2026.

The repository's last pre-revival push was November 26, 2024. Its original proxy signs a JWT without expiration or audience, places it in a caller-selected WebSocket URL, and logs received message bodies. The original workflow tests bypass the proxy's internals to send their own messages. They establish a socket connection, not production MCP federation correctness.

We retire legacy proxy registration before it creates credentials or opens a socket. This is an intentional breaking security change. Removal and empty status remain harmless. The separate modern package implements a narrow public observation interface with the official MCP SDK, fixed x.ruv.io destination and explicit tool names. No remote result may register a destination, introduce a tool or grant task execution. No gateway token is requested or forwarded.

Current MCP security guidance forbids token passthrough and discusses SSRF, scope minimization and local proxy boundaries. The implementation addresses only its own bounded observation surface. Legacy edge deployments, Supabase functions, authorization, deployment scripts and dependency trees remain outside the modern package's qualification.

Alternative: retrofit the custom WebSocket protocol. Rejected because it preserves a nonstandard transport and authentication model while leaving lifecycle and routing work unfinished. Alternative: rebuild a general federated execution platform. Deferred until audience-bound credentials, per-client consent, constrained egress and authorization semantics have their own acceptance suite.

Acceptance: legacy registration opens zero sockets; modern stdio calls route only fixed reads; forged destinations and write names fail locally; oversized or stalled responses are bounded; npm audit and tests pass for the modern package. No claim of current best performance follows from this architecture.

Sources:

1. https://modelcontextprotocol.io/specification/2025-11-25/basic/security_best_practices
2. https://modelcontextprotocol.io/specification/2025-11-25/basic/transports
3. https://github.com/ruvnet/federated-mcp/tree/486dc9c022a51bea0775e645e206336ee66212de
