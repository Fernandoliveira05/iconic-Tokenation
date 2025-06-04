// src/users/promote-iconic.guard.ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { SuiService } from '../sui/sui.service';

@Injectable()
export class PromoteIconicGuard implements CanActivate {
  constructor(private suiService: SuiService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (user?.role === Role.admin) return true;

    const txId = req.headers['x-transaction-id'] as string;
    if (!txId) throw new ForbiddenException('Transaction ID header required.');

    const confirmed = await this.suiService.isTransactionConfirmed(txId);
    if (!confirmed) throw new ForbiddenException('Sui transaction not confirmed.');

    return true;
  }
}
