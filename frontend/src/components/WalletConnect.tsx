// src/components/WalletConnect.tsx
import React from "react";
import { ConnectButton, useWallet } from "@suiet/wallet-kit";

export function WalletConnect() {
  const { connected, account } = useWallet();

  return (
    <div>
      <ConnectButton />
      {connected && (
        <p className="mt-2 text-sm">
          Conectado como <code>{account?.address}</code>
        </p>
      )}
    </div>
  );
}