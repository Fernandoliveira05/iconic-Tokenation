module move_paywall::Paywall {
    use 0x2::tx_context::{TxContext, sender};
    use 0x2::coin::{withdraw};
    use 0x2::object::{UID, new};
    use 0x2::transfer::public_transfer;

    /// Resource que guarda o valor pago
    struct Pass has key, store {
        id: UID,
        balance: u64,
    }

    /// Compra o passe por `amount` nanocoin (SUI * 1e9)
    public entry fun buy_pass(amount: u64, ctx: &mut TxContext) {
        // 1) Retira `amount` SUI do remetente como pagamento
        let _payment = withdraw(ctx, amount);
        
        // 2) Cria um novo UID para o recurso e instância Pass
        let id = new(ctx);
        let pass = Pass { id, balance: amount };

        // 3) Transfere o Pass de volta ao remetente para registrar posse
        public_transfer(pass, sender(ctx));
    }
}