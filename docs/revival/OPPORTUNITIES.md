# Dormant repository revival candidates

Observed September 10, 2026. Selection uses GitHub pushed_at before September 10, 2025, excluding forks and archived repositories. This measures repository push inactivity, not whether rUv read issues, worked locally or contributed elsewhere. updated_at is unsuitable because stars and other metadata activity can change it. Evidence is in candidates.json. This is a targeted shortlist, not an exhaustive census.

Scores are engineering judgments from 1 to 5. Total = twice stack fit + security value + feasibility. Effort is an initial engineer-day estimate, not a delivery promise. Scope includes tests and a reviewable pilot, not complete production qualification.

| Repository | Last push before revival | Fit | Security | Feasibility | Total /20 | Pilot effort | Proposed outcome |
| :--- | :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| federated-mcp | 2024-11-26 | 5 | 5 | 5 | 20 | 2 to 4 days | Current SDK, bounded federation observations, retirement of URL token transport |
| Agent-Name-Service | 2025-05-16 | 5 | 5 | 3 | 18 | 4 to 8 days | Cryptographically verified identity discovery and explicit trust roots for federation peers |
| guardrail | 2023-12-12 | 4 | 5 | 4 | 17 | 3 to 6 days | Deterministic policy correctness, adversarial regression corpus, governed model evaluation |
| agentic-search | 2025-05-20 | 4 | 4 | 4 | 16 | 3 to 6 days | Authenticated retrieval with citations and measured RuVector ranking |
| auto-browser | 2025-01-24 | 4 | 4 | 3 | 15 | 4 to 8 days | Constrained browser actions, isolated credentials and replayable task traces |
| agentic-voice | 2024-07-15 | 4 | 3 | 3 | 14 | 4 to 8 days | Measured streaming voice interruption and latency, short lived session credentials |
| ultrasonic | 2025-06-09 | 4 | 3 | 2 | 13 | 5 to 10 days | Consensual acoustic data transport evaluation with authenticated inert payloads |
| promptlang | 2023-12-12 | 3 | 3 | 4 | 13 | 2 to 4 days | Typed, bounded prompt policy compiler and reproducible evaluation inputs |

First implementation targets federated-mcp because it improves the current federation integration with a small auditable scope. guardrail's confirmed policy bug is suitable for a separate small patch. Consolidate obsolete orchestration into RuFlo rather than maintaining a competing runtime in every revived repository.

Better than current methods is a hypothesis. For discovery, compare signature and certificate rejection correctness, revocation behavior and p95 lookup latency against a pinned baseline. For retrieval, compare recall@10, citation precision, latency and cost on the same sealed corpus. For policies, measure unsafe accepts and false refusals on a held out adversarial corpus. For voice, measure first audio and interruption latency, packet loss and cost per successful conversation. For acoustic data, measure bit error rate and throughput over declared physical channels and noise levels, never covert command execution. No superiority claim is made before those experiments.

Primary source links are the repository URLs in candidates.json; verified code findings and scope are described in ADR 001 and the accompanying PRs. Scores for candidates not deeply inspected are provisional.

## Confirmed findings from deeper inspection

Agent Name Service at commit 976e9e91e77213698cb7af479aa94bdaae084fa6 accepts certificate delimiters without signature verification in src/certificate.ts; a second implementation accepts text containing Certificate and returns mock keys. Replace these with verified identities before connecting discovery to authorization. No ANS fix is included in this revival patch.

Guardrail at commit 67cc25b7c52acf69bcdea00b094962e06760efe5 returns true for a missing path under an exists condition. A separate patch targets that demonstrated defect. Regex resource bounds and provider concurrency remain separate work.

Agentic search has a last default branch commit dated October 4, 2024, although its last push is May 20, 2025. Its index.js logs full request payloads and retrieved content, and the inspected request path does not verify extension request signatures. The npm manifest has no test script. Replace the obsolete extension architecture with a transport independent retrieval service, then validate against [BEIR](https://arxiv.org/abs/2104.08663). Use [AgentDojo](https://arxiv.org/abs/2406.13352) to assess policy defenses rather than relying only on happy path examples.

The official [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) now identifies split client and server v2 as stable for the July 28, 2026 specification. The revived modern package pins those packages instead of assuming the old monolithic SDK latest tag is the newest architecture.
