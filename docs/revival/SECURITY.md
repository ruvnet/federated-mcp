# Security review scope and residual risks

Reviewed September 10, 2026 against baseline 486dc9c022a51bea0775e645e206336ee66212de. Assets are federation credentials, local network access, MCP host integrity and returned observations. Attackers include malicious remote result authors and callers choosing server configuration.

Confirmed in the legacy proxy: createToken receives no expiry or audience; establishConnection places the token in a caller supplied URL; handleMessage logs message contents. The function is exported and exercised by the original tests. No production deployment was tested and no credential exfiltration was attempted. Retiring registerServer removes this path before token generation or network access. This intentionally breaks the insecure demonstration workflow rather than pretending it is compatible with current MCP.

The new package is a local observation bridge. It does not authenticate remote users, execute arbitrary tools, carry upstream tokens, confer Nostr signature proof or serve as an authorization boundary for other legacy code. Keep all returned content untrusted. A compromised fixed gateway may still return malicious text. Local MCP host policy must not treat text as instructions.

RuFlo 3.25.6 swarm initialization succeeded and security scan of src/packages/proxy after the fix reported zero findings. This is advisory evidence only. The selected regression tests and package audit are the acceptance evidence; no whole repository clean bill is claimed. Historical root, src and supa_src dependency trees and deployment examples require separate migration. Their unpinned imports and old packages are not resolved by a clean modern package audit.

No production credentials, enrollment, remote task execution, federation publication or deployment occurred. Draft pull requests preserve review and rollback. Reverting the modern addition is straightforward; reverting legacy retirement would restore the documented credential risk.
