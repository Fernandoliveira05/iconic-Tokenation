// src/payment/payment.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

interface TransactionEffectsResponse {
  status: { status: 'success' | string };
  effects: {
    events: Array<{
      transfer?: { recipient: string };
    }>;
  };
}

@Controller('payment')
export class PaymentController {
  private client = new SuiClient({
    url: getFullnodeUrl('testnet'),
  });

  @Post('confirm')
  async confirmPayment(
    @Body() body: { txDigest: string; userId: string }
  ) {
    const { txDigest } = body;

    // 1) Busca efeitos da transação e faz cast
    const raw = await this.client.call(
      'sui_getTransactionEffects',
      [txDigest]
    );
    const effects = raw as TransactionEffectsResponse;

    // 2) Verifica status
    if (effects.status.status !== 'success') {
      throw new Error('Transação não foi bem-sucedida');
    }

    // 3) Procura transfers para seu PAYWALL_ADDRESS
    const transfers = effects.effects.events.filter(
      (e) => e.transfer?.recipient === process.env.PAYWALL_ADDRESS
    );
    if (transfers.length === 0) {
      throw new Error(
        'Nenhuma transferência para o paywall address encontrada'
      );
    }

    // 4) Registre o pagamento no BD aqui…
    return { ok: true };
  }
}
