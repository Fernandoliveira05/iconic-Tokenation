import React, { useState } from "react";
import { usePaywall } from "@/lib/sui";
import { useWallet } from "@suiet/wallet-kit";

// Exemplo de alerta animado (coloque seu componente real aqui!)
function AnimatedAlert({ message, type, onClose }: { message: string, type: "success" | "error", onClose: () => void }) {
  if (!message) return null;
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[99] px-6 py-3 rounded-xl shadow-lg text-white
      ${type === "success"
        ? "bg-gradient-to-r from-[#FF8CAB] via-[#FF72D3] to-[#6A4CFF]"
        : "bg-gradient-to-r from-rose-400 via-pink-500 to-purple-600"}
      animate-bounce-in
    `}>
      <span className="font-semibold">{message}</span>
      <button className="ml-4 text-white/60 hover:text-white" onClick={onClose}>&times;</button>
    </div>
  );
}

export function PayButton() {
  const { connected } = useWallet();
  const { payFee } = usePaywall();
  const [loading, setLoading] = useState(false);

  // Estado para o alert animado
  const [alert, setAlert] = useState<{ message: string, type: "success" | "error" } | null>(null);

  if (!connected) {
    return <p>Connect your wallet to pay.</p>;
  }

  async function handlePay() {
    setLoading(true);
    try {
      const digest = await payFee(1);
      setAlert({ message: "Payment successful! Access granted.", type: "success" });
      // Opcional: envie digest ao backend para confirmação
    } catch (err: any) {
      console.error(err);
      setAlert({ message: err.message || "Payment failed.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={handlePay}
        disabled={loading}
        className={`w-full py-2 rounded-lg text-white font-semibold transition
          ${loading ? "bg-gray-400" : "bg-gradient-to-r from-[#FF8CAB] via-[#FF72D3] to-[#6A4CFF] hover:brightness-105"}`}
      >
        {loading ? "Processing..." : "Pay 1 SUI"}
      </button>

      {alert && (
        <AnimatedAlert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
    </>
  );
}
