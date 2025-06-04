import React, { useCallback } from "react";
import { ConnectButton } from "@suiet/wallet-kit";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext"; // ← NEW

interface BecomeIconicCardProps {
  connected: boolean;
  connect: () => Promise<void>;
  waiting: boolean;
  onSubscribe: () => Promise<void>;
  feeAmount?: number;
  networkName?: string;
}

export function BecomeIconicCard({
  connected,
  connect,
  waiting,
  onSubscribe,
  feeAmount = 0.1,
  networkName = "Sui Testnet",
}: BecomeIconicCardProps) {
  const { refresh } = useAuth(); // ← NEW

  const handleConnect = useCallback(async () => {
    try {
      await connect();
      toast.success("Wallet connected!");
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.message
          ? `Connection failed: ${err.message}`
          : "Failed to connect wallet."
      );
    }
  }, [connect]);

  const handleSubscribe = useCallback(async () => {
    try {
      await onSubscribe();
      await refresh(); // ← NEW (reload role)
      toast.success("Welcome — you’re now ICONIC!");
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.message
          ? `Transaction failed: ${err.message}`
          : "Subscription failed."
      );
    }
  }, [onSubscribe, refresh]); // ← include dep

  return (
    <div className="w-full max-w-md rounded-2xl bg-gradient-to-br from-[#FF8CAB] via-[#FF72D3] to-[#6A4CFF] animate-gradient-pan shadow-xl mx-auto">
      <div className="rounded-2xl bg-white/95 p-7 flex flex-col items-center gap-3">
        <h2 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#FF8CAB] via-[#FF72D3] to-[#6A4CFF] tracking-tight uppercase">
          Become ICONIC
        </h2>

        <p className="text-base font-medium text-gray-700 text-center">
          Unlock exclusive experiences and join the ICONIC circle.
        </p>

        <ul className="text-gray-600 text-sm text-left list-disc pl-4 space-y-1">
          <li>Access premium, members-only events.</li>
          <li>Showcase your ICONIC badge across the platform.</li>
          <li>Priority entry, VIP opportunities, and more.</li>
        </ul>

        <div className="inline-block bg-gradient-to-r from-[#FF8CAB] via-[#FF72D3] to-[#6A4CFF] px-4 py-2 rounded-full text-white font-semibold text-base shadow animate-pulse">
          Only <span className="font-extrabold">{feeAmount} SUI</span> on{" "}
          {networkName}
        </div>

        <p className="text-xs text-gray-500 text-center">
          <span className="font-bold text-[#6A4CFF]">Ultra-fast payment</span>{" "}
          powered by <span className="font-bold">{networkName}</span>. Just
          approve in your wallet and you’re in!
        </p>

        <div className="w-full mt-4">
          {!connected ? (
            <ConnectButton
              className="w-full py-2 bg-gray-800 text-white rounded-lg text-lg font-bold"
              onClick={handleConnect}
            >
              Connect Wallet
            </ConnectButton>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={waiting}
              className={`w-full py-3 rounded-xl font-bold text-lg shadow transition-all ${
                waiting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#FF8CAB] via-[#FF72D3] to-[#6A4CFF] text-white hover:brightness-105"
              }`}
            >
              {waiting ? "Processing…" : "Become ICONIC Now"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
