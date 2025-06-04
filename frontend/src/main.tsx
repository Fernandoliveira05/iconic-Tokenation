import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import "@suiet/wallet-kit/style.css";

import { WalletProvider, SuiTestnetChain } from "@suiet/wallet-kit";

import { AuthProvider } from "@/contexts/AuthContext";
import { AppRoutes } from "@/router/routes";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WalletProvider
      chains={[SuiTestnetChain]}          // define a lista de chains suportadas
      defaultChain={SuiTestnetChain}      // define a chain padrão ao conectar
      autoConnect                         // tenta reconectar a última wallet automaticamente
    >
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </WalletProvider>
  </React.StrictMode>
);
