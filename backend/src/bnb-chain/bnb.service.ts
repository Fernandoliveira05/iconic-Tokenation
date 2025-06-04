import { Injectable, InternalServerErrorException } from '@nestjs/common';

// Usando a importação correta do ethers.js para CommonJS
import * as ethers from 'ethers'; // Alteração para usar "import * as ethers" para garantir a disponibilidade dos tipos

// Importando o ABI do contrato
import IconicABI from './IconicMembership.abi.json';

@Injectable()
export class BnbService {
  private provider: ethers.JsonRpcProvider; // Usando JsonRpcProvider corretamente
  private contractAddress: string;
  private contract: ethers.Contract;

  constructor() {
    // URL do RPC da BNB Chain (pode ser Mainnet ou Testnet)
    const rpcUrl =
      process.env.BNB_RPC_URL ||
      'https://data-seed-prebsc-1-s1.binance.org:8545'; // BSC Testnet
    this.provider = new ethers.JsonRpcProvider(rpcUrl); // Inicializando o provider corretamente

    // Endereço do contrato já deployado na BNB Chain
    this.contractAddress =
      process.env.ICONIC_CONTRACT_ADDRESS ||
      '0x667b4b89D5B67359360FcC374E3d2bAf25F87481';

    // Criando uma instância do contrato usando o provider
    this.contract = new ethers.Contract(
      this.contractAddress,
      IconicABI,
      this.provider,
    );
  }

  /**
   * Recupera o recibo (receipt) de uma transação através do hash.
   * Retorna null se a transação não for encontrada ou tiver falhado (status != 1).
   */
  async getTransactionReceipt(
    txHash: string,
  ): Promise<ethers.TransactionReceipt | null> {
    // Corrigido para usar ethers.TransactionReceipt
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash); // Recupera o recibo
      if (!receipt || receipt.status !== 1) {
        return null; // Se o status não for 1 (sucesso), retorna null
      }
      return receipt;
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao obter recibo de transação',
      );
    }
  }

  /**
   * Verifica nos logs da transação se o evento 'UserBecameIconic' foi emitido
   * e se o argumento `user` do evento bate com o endereço passado.
   */
  async didUserBecomeIconicInTx(
    receipt: ethers.TransactionReceipt, // Corrigido o tipo para TransactionReceipt
    userAddress: string,
  ): Promise<boolean> {
    try {
      // Usando o ABI para decodificar os logs da transação
      const iface = new ethers.Interface(IconicABI); // Acessando a Interface para decodificação
      for (const log of receipt.logs) {
        // Verifica se o log é do contrato correto
        if (log.address.toLowerCase() === this.contractAddress.toLowerCase()) {
          try {
            // Tenta decodificar o log usando a interface ABI
            const parsed = iface.parseLog(log);
            if (parsed.name === 'UserBecameIconic') {
              const eventUser: string = parsed.args['user'];
              if (eventUser.toLowerCase() === userAddress.toLowerCase()) {
                return true; // Se o endereço do evento bater com o do usuário, retorna true
              }
            }
          } catch {
            // Se o log não for o esperado, ignora e continua
          }
        }
      }
      return false; // Retorna false caso o evento não seja encontrado
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao analisar logs da transação',
      );
    }
  }

  /**
   * Chama a função 'isIconic' do contrato para verificar se o usuário já é considerado 'Iconic'.
   */
  async isUserIconic(userAddress: string): Promise<boolean> {
    try {
      return await this.contract.isIconic(userAddress); // Chama o contrato para verificar o status
    } catch (error) {
      throw new InternalServerErrorException('Erro ao verificar status Iconic');
    }
  }
}
