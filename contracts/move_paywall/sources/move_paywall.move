module move_paywall::Paywall {
    use sui::signer;
    use sui::coin::{withdraw_from};
    use sui::sui::{SUI};

    /// Cobra o valor em SUI (nanocoin) e consome a coin.
    public entry fun buy_pass(owner: &signer, amount: u64) {
        // 1) Retira `amount` nanocoin de SUI do remetente e consome como pagamento
        let _payment: coin::Coin<SUI> = withdraw_from(owner, amount);
        // Observação: aqui descartamos o recurso, mas poderia emitir um event ou armazenar off-chain
    }
}