import React, { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth to get internal user ID
import { useBnbPaywall } from "@/hooks/useBnbPaywall";
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";

// Helper to format wallet address
const formatAddress = (address: string | null | undefined): string => {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};

// Define the correct provider type based on ethers v5
type EthersProvider = ethers.providers.Web3Provider;

// Base URL for the API, fetched from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""; // Default to empty string if not set

export function BecomeIconicCard() {
  // Use useAuth to get user data, including the internal ID
  const { user, refresh } = useAuth(); 
  const {
    loading: paywallLoading,
    payFee,
    paymentAmount,
    isCorrectNetwork,
    networkName,
  } = useBnbPaywall();

  // Use the correct provider type with useWeb3React
  const { account, isActive, connector, chainId } = useWeb3React<EthersProvider>();

  // State for UI feedback and errors
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [web3Error, setWeb3Error] = useState<Error | null>(null);

  useEffect(() => {
    // Clear error on account or chain change
    setWeb3Error(null);
  }, [account, chainId]);

  // Connect using the connector from Web3React
  const handleConnect = useCallback(async () => {
    setIsConnecting(true);
    setWeb3Error(null);
    try {
      // Ensure connector has activate method before calling
      if (connector && typeof connector.activate === 'function') {
        await connector.activate();
        toast.success("Carteira conectada!");
      } else {
        throw new Error("Conector inválido ou não suporta ativação.");
      }
    } catch (err: any) {
      console.error("Falha ao conectar carteira:", err);
      const message = err.message || "Erro desconhecido ao conectar.";
      setWeb3Error(new Error(message));
      toast.error(`Falha na conexão: ${message}`);
    } finally {
      setIsConnecting(false);
    }
  }, [connector]);

  // Disconnect using the connector
  const handleDisconnect = useCallback(async () => {
    setWeb3Error(null);
    try {
      if (connector?.deactivate) {
        await connector.deactivate();
      } else if (connector?.resetState) {
        // Fallback for connectors without deactivate
        await connector.resetState();
      } else {
        console.warn("Conector não suporta desconexão.")
      }
      toast.info("Carteira desconectada.");
    } catch (err: any) {
      console.error("Falha ao desconectar:", err);
      const message = err.message || "Erro desconhecido ao desconectar.";
      setWeb3Error(new Error(message));
      toast.error(`Falha ao desconectar: ${message}`);
    }
  }, [connector]);

  // Subscribe logic
  const handleSubscribe = useCallback(async () => {
    // Ensure user is authenticated and has an internal ID
    if (!user || !user.id) {
      toast.error("Usuário não autenticado. Faça login primeiro.");
      return;
    }
    if (!isActive || !account) {
      toast.error("Carteira não conectada.");
      return;
    }
    if (!isCorrectNetwork) {
      toast.error(`Por favor, conecte-se à rede ${networkName}.`);
      return;
    }
    if (!API_BASE_URL) {
        toast.error("Configuração da API não encontrada. Contate o suporte.");
        console.error("VITE_API_BASE_URL não está definida no ambiente.");
        return;
    }

    setWeb3Error(null);
    setIsSubscribing(true);
    try {
      const txHash = await payFee();
      toast.info(
        `Transação enviada: ${formatAddress(txHash)}. Aguardando confirmação...`
      );

      // Construct the full API URL
      const apiUrl = `${API_BASE_URL}/api/payment/confirm`;
      console.log(`Chamando API de confirmação: ${apiUrl}`); // Log API URL

      // Backend confirmation call - SEND INTERNAL USER ID and WALLET ADDRESS
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Send internal user ID and wallet address separately
        body: JSON.stringify({ 
            txHash: txHash, 
            userId: user.id, // Send internal ID from useAuth context
            walletAddress: account // Send wallet address for blockchain check
        }),
      });

      // Improved error handling for fetch response
      if (!response.ok) {
        let errorMessage = `Falha na confirmação (Status: ${response.status})`;
        try {
          // Try to parse error message from backend if available
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If response is not JSON or empty, use the status text
          errorMessage = `${errorMessage}: ${response.statusText}`;
          console.error("Não foi possível parsear a resposta de erro da API como JSON.", jsonError);
        }
        throw new Error(errorMessage);
      }

      // Attempt to parse the success response (optional, depends on backend)
      try {
        const result = await response.json();
        console.log("Resposta da confirmação:", result);
      } catch (jsonError) {
        console.warn("Resposta de sucesso da API não é JSON ou está vazia.");
      }

      await refresh(); // Refresh user auth state to reflect ICONIC status
      toast.success("Bem-vindo! Você agora é ICONIC!");

    } catch (err: any) {
      console.error("Erro ao se inscrever:", err);
      const message = err.message || "Falha ao se inscrever.";
      setWeb3Error(new Error(message));
      toast.error(`Erro: ${message}`);
    } finally {
      setIsSubscribing(false);
    }
  }, [
    payFee,
    isActive,
    account,
    user, // Add user dependency from useAuth
    refresh,
    isCorrectNetwork,
    networkName,
    connector 
  ]);

  const isLoading = paywallLoading || isSubscribing || isConnecting;

  return (
    <div className="w-full max-w-md rounded-2xl bg-gradient-to-br from-[#FF8CAB] via-[#FF72D3] to-[#6A4CFF] animate-gradient-pan shadow-xl mx-auto">
      <div className="rounded-2xl bg-white/95 p-7 flex flex-col items-center gap-3">
        <h2 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#FF8CAB] via-[#FF72D3] to-[#6A4CFF] tracking-tight uppercase">
          Become ICONIC
        </h2>

        <p className="text-base font-medium text-gray-700 text-center">
          Desbloqueie experiências exclusivas e junte-se ao círculo ICONIC.
        </p>

        <ul className="text-gray-600 text-sm text-left list-disc pl-4 space-y-1">
          <li>Acesse eventos premium exclusivos para membros.</li>
          <li>Mostre seu emblema ICONIC em toda a plataforma.</li>
          <li>Entrada prioritária, oportunidades VIP e mais.</li>
        </ul>

        {paymentAmount && (
          <div className="inline-block bg-gradient-to-r from-[#FF8CAB] via-[#FF72D3] to-[#6A4CFF] px-4 py-2 rounded-full text-white font-semibold text-base shadow animate-pulse">
            Apenas <span className="font-extrabold">{paymentAmount} BNB</span>{" "}
            na {networkName}
          </div>
        )}

        <p className="text-xs text-gray-500 text-center">
          <span className="font-bold text-[#6A4CFF]">
            Pagamento ultra-rápido
          </span>{" "}
          potencializado por <span className="font-bold">{networkName}</span>.
          Apenas aprove em sua carteira e você está dentro!
        </p>

        <div className="w-full mt-4">
          {/* Check if user is authenticated first */}
          {!user ? (
             <p className="text-center text-red-500">Por favor, faça login para continuar.</p>
          ) : !isActive ? (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className={`w-full py-2 bg-gray-800 text-white rounded-lg text-lg font-bold transition-opacity ${
                isConnecting
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:opacity-90"
              }`}
            >
              {isConnecting ? "Conectando..." : "Conectar Carteira (MetaMask)"}
            </button>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm text-gray-600">
                Conectado como: {formatAddress(account)}
              </span>
              {!isCorrectNetwork && (
                <span className="text-xs text-red-500">
                  Rede incorreta! Conecte-se à {networkName}.
                </span>
              )}
              <button
                onClick={handleSubscribe}
                // Disable if loading, wrong network, not active, or user ID is missing
                disabled={isLoading || !isCorrectNetwork || !isActive || !user?.id}
                className={`w-full py-3 rounded-xl font-bold text-lg shadow transition-all ${
                  isLoading || !isCorrectNetwork || !isActive || !user?.id
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#FF8CAB] via-[#FF72D3] to-[#6A4CFF] text-white hover:brightness-105"
                }`}
              >
                {isSubscribing ? "Processando..." : "Tornar-se ICONIC Agora"}
              </button>
              <button
                onClick={handleDisconnect}
                className="text-xs text-gray-500 hover:text-gray-700 mt-1"
              >
                Desconectar
              </button>
            </div>
          )}
          {web3Error && (
            <p className="text-xs text-red-500 mt-2 text-center">
              Erro: {web3Error.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

