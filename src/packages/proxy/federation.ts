import type { FederationConfig } from '../core/types.ts';

/**
 * Retired legacy transport. The former implementation placed reusable JWTs in
 * caller-selected WebSocket URLs and never implemented MCP tool routing.
 * Use modern/ for bounded public federation observations. There is no insecure
 * compatibility switch: authenticated arbitrary federation needs a new design.
 */
export class FederationProxy {
  constructor(_secret: string) {}

  async registerServer(_config: FederationConfig): Promise<void> {
    throw new Error('Legacy federation transport retired: use modern/ observation adapter');
  }

  async removeServer(_serverId: string): Promise<void> {}

  getConnectedServers(): string[] {
    return [];
  }
}
