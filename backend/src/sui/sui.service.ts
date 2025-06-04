import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SuiClient } from '@mysten/sui.js/client';

@Injectable()
export class SuiService {
  private client: SuiClient;

  constructor() {
    const rpcUrl =
      process.env.SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443';
    console.log('SUI RPC URL =', rpcUrl);
    this.client = new SuiClient({ url: rpcUrl });
  }

  /**
   * Faz polling até a tx ser confirmada ou timeout de 60s.
   */
  async isTransactionConfirmed(txId: string): Promise<boolean> {
    const timeoutMs = 60_000;
    const pollIntervalMs = 5_000;
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
      try {
        const tx = await this.client.getTransactionBlock({
          digest: txId,
          options: { showEffects: true },
        });
        if (tx.effects?.status.status === 'success') {
          return true;
        }
      } catch {
        // ainda não indexada
      }
      // espera antes de tentar de novo
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }

    // timeout
    return false;
  }
}
