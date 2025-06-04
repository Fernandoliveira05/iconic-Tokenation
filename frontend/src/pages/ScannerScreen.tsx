// src/pages/ScannerScreen.tsx

import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

interface ScannedUser {
  full_name: string;
  nickname: string;
  email: string;
  date_of_birth: string;
  is_iconic: boolean;
}

export default function ScannerScreen() {
  const { user } = useAuth();
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [message, setMessage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);
  const [scannedUser, setScannedUser] = useState<ScannedUser | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Só admin/scanner
  useEffect(() => {
    if (!user) return;
    if (!["admin", "scanner"].includes(user.role)) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const elementId = "reader";
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    const cameraConfig = { facingMode: "environment" };

    const qr = new Html5Qrcode(elementId);
    html5QrCodeRef.current = qr;

    const onScanSuccess = async (decoded: string) => {
      setScanning(false);
      try {
        await qr.stop();
      } catch {}
      setMessage("Validando...");
      try {
        const { data } = await api.post<{
          user: ScannedUser;
        }>("/event-checkins/scan", { qr_token: decoded });
        setScannedUser(data.user);
        setMessage("Autenticação bem-sucedida");
      } catch (err: any) {
        setMessage(err.response?.data?.message || "Erro ao autenticar QR");
      }
    };

    const onScanError = (_: any) => {
      /* frame errors ignorados */
    };

    // inicia
    qr.start(cameraConfig, config, onScanSuccess, onScanError).catch((err) => {
      console.error("Não foi possível iniciar scanner:", err);
      setMessage("Erro ao acessar a câmera");
      setScanning(false);
    });

    return () => {
      if (qr) {
        (async () => {
          try {
            await qr.stop();
          } catch {}
          try {
            qr.clear();
          } catch {}
        })();
      }
    };
  }, []);

  const restart = async () => {
    const qr = html5QrCodeRef.current;
    if (!qr) return;
    setMessage(null);
    setScannedUser(null);
    setScanning(true);
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    const cameraConfig = { facingMode: "environment" };
    qr.start(
      cameraConfig,
      config,
      async (decoded) => {
        // repetição da lógica de onScanSuccess
        setScanning(false);
        try {
          await qr.stop();
        } catch {}
        setMessage("Validando...");
        try {
          const { data } = await api.post<{ user: ScannedUser }>(
            "/event-checkins/scan",
            { qr_token: decoded }
          );
          setScannedUser(data.user);
          setMessage("Autenticação bem-sucedida");
        } catch (err: any) {
          setMessage(err.response?.data?.message || "Erro ao autenticar QR");
        }
      },
      () => {}
    ).catch((err) => {
      console.error(err);
      setMessage("Erro ao reiniciar scanner");
      setScanning(false);
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 pt-16 pb-16">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        {scanning && (
          <div
            id="reader"
            className="w-full max-w-md rounded-lg overflow-hidden"
          />
        )}

        {message && !scannedUser && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow text-center space-y-3">
            <p className="font-medium">{message}</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={restart}
                className="px-4 py-2 bg-primary text-white rounded-full"
              >
                Voltar a escanear
              </button>
              <button
                onClick={() => navigate(`/events/${eventId}`)}
                className="px-4 py-2 border border-primary text-primary rounded-full"
              >
                Voltar ao evento
              </button>
            </div>
          </div>
        )}

        {scannedUser && (
          <div className="mt-4 p-6 bg-white rounded-lg shadow text-left space-y-2">
            <h3 className="text-lg font-semibold">Dados do Usuário</h3>
            <p>
              <strong>Nome:</strong> {scannedUser.full_name}
            </p>
            <p>
              <strong>Nickname:</strong> {scannedUser.nickname}
            </p>
            <p>
              <strong>Email:</strong> {scannedUser.email}
            </p>
            <p>
              <strong>Data de Nascimento:</strong>{" "}
              {new Date(scannedUser.date_of_birth).toLocaleDateString()}
            </p>
            <p>
              <strong>É Iconic:</strong> {scannedUser.is_iconic ? "Sim" : "Não"}
            </p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={restart}
                className="px-4 py-2 bg-primary text-white rounded-full"
              >
                Escanear Outro
              </button>
              <button
                onClick={() => navigate(`/events/${eventId}`)}
                className="px-4 py-2 border border-primary text-primary rounded-full"
              >
                Voltar ao evento
              </button>
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
