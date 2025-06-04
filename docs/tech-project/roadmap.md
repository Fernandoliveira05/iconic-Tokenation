// src/App.tsx

  

import React, { useState, useEffect, useRef } from "react";

import { loginWithGoogle } from "./firebase";

import axios from "axios";

import { Html5QrcodeScanner } from "html5-qrcode";

import { supabase } from "./supabaseClient";

  

const API_BASE = "http://localhost:3000";

  

const App: React.FC = () => {

  const [jwt, setJwt] = useState<string | null>(null);

  const [me, setMe] = useState<any>(null);

  const [error, setError] = useState<string | null>(null);

  

  const [events, setEvents] = useState<any[]>([]);

  const [participations, setParticipations] = useState<any[]>([]);

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const [confirmedUsers, setConfirmedUsers] = useState<any[]>([]);

  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const [expandedUserData, setExpandedUserData] = useState<any | null>(null);

  

  const [qrImage, setQrImage] = useState<string | null>(null);

  const [showScanner, setShowScanner] = useState<boolean>(false);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  

  // — AUTH —

  const handleLogin = async () => {

    try {

      const idToken = await loginWithGoogle();

      const res = await axios.post(`${API_BASE}/auth/login/firebase`, {

        idToken,

      });

      setJwt(res.data.access_token);

      setError(null);

      // carregar dados logo após autenticar

      await loadData();

    } catch {

      alert("Falha na autenticação");

      setError("Falha na autenticação");

    }

  };

  

  // — LOAD PROFILE & PARTICIPATIONS & EVENTS —

  const loadData = async () => {

    if (!jwt) return;

    try {

      const [meRes, partsRes, eventsRes] = await Promise.all([

        axios.get(`${API_BASE}/users/me`, {

          headers: { Authorization: `Bearer ${jwt}` },

        }),

        axios.get(`${API_BASE}/event-participations`, {

          headers: { Authorization: `Bearer ${jwt}` },

        }),

        axios.get(`${API_BASE}/events/public`),

      ]);

      setMe(meRes.data);

      setParticipations(partsRes.data);

      setEvents(eventsRes.data);

      setError(null);

    } catch {

      alert("Erro ao carregar dados");

      setError("Erro ao carregar dados");

    }

  };

  

  // — LOAD CONFIRMED USERS —

  const loadConfirmedUsers = async (eventId: string) => {

    setSelectedEventId(eventId);

    try {

      const res = await axios.get(

        `${API_BASE}/event-participations/event/${eventId}/confirmed-users`,

        { headers: { Authorization: `Bearer ${jwt}` } }

      );

      setConfirmedUsers(res.data);

      setError(null);

    } catch {

      setConfirmedUsers([]);

      setError(null);

    }

  };

  

  // — PARTICIPATION & CANCEL —

  const participateEvent = async (evtId: string) => {

    try {

      await axios.post(

        `${API_BASE}/event-participations`,

        { event_id: evtId },

        { headers: { Authorization: `Bearer ${jwt}` } }

      );

      await loadData();

      await loadConfirmedUsers(evtId);

      setError(null);

    } catch (err: any) {

      const msg =

        err.response?.data?.message || err.message || "Erro ao participar";

      alert(msg);

      setError(msg);

    }

  };

  

  const cancelParticipation = async (evtId: string) => {

    const part = participations.find((p) => p.event_id === evtId);

    if (!part) return;

    try {

      await axios.patch(

        `${API_BASE}/event-participations/${part.id}`,

        { status: "cancelled" },

        { headers: { Authorization: `Bearer ${jwt}` } }

      );

      alert("Participação cancelada");

      await loadData();

      setConfirmedUsers([]);

      setError(null);

    } catch (err: any) {

      const msg =

        err.response?.data?.message || err.message || "Erro ao cancelar";

      alert(msg);

      setError(msg);

    }

  };

  

  // — QR GENERATE & SCAN —

  const generateCheckin = async () => {

    if (!selectedEventId) return;

    try {

      const res = await axios.post(

        `${API_BASE}/event-checkins/generate`,

        { event_id: selectedEventId },

        { headers: { Authorization: `Bearer ${jwt}` } }

      );

      setQrImage(res.data.qr_code_url);

      alert("QR code gerado! Você tem 60 segundos para escanear.");

      setError(null);

    } catch (err: any) {

      const msg =

        err.response?.data?.message || err.message || "Erro ao gerar QR";

      alert(msg);

      setError(msg);

    }

  };

  

  const scanCheckin = async (token: string) => {

    try {

      const res = await axios.post(

        `${API_BASE}/event-checkins/scan`,

        { qr_token: token },

        { headers: { Authorization: `Bearer ${jwt}` } }

      );

      // agora o backend retorna .user com os campos solicitados

      const { full_name, nickname, email, date_of_birth, is_iconic } =

        res.data.user;

      alert(

        `Check-in bem-sucedido!\n` +

          `Nome: ${full_name}\n` +

          `Nickname: ${nickname}\n` +

          `Email: ${email}\n` +

          `Data de nascimento: ${new Date(

            date_of_birth

          ).toLocaleDateString()}\n` +

          `Ícone: ${is_iconic ? "Sim" : "Não"}`

      );

      setError(null);

    } catch (err: any) {

      const msg = err.response?.data?.message || err.message || "Erro no scan";

      alert(msg);

      setError(msg);

    }

  };

  

  // — TOGGLE SCANNER —

  useEffect(() => {

    if (

      showScanner &&

      jwt &&

      (me?.role === "admin" || me?.role === "scanner")

    ) {

      scannerRef.current?.clear().catch(() => {});

      scannerRef.current = new Html5QrcodeScanner(

        "scanner",

        { fps: 10, qrbox: 250 },

        false

      );

      scannerRef.current.render(

        (decoded) => {

          scanCheckin(decoded);

          scannerRef.current?.clear().then(() => setShowScanner(false));

        },

        () => {

          /* ignorar erros de parse */

        }

      );

    }

    return () => {

      scannerRef.current?.clear().catch(() => {});

      scannerRef.current = null;

    };

  }, [showScanner, jwt, me]);

  

  // — EFFECTS LOAD —

  useEffect(() => {

    if (jwt) loadData();

  }, [jwt]);

  

  // — RENDER —

  return (

    <div

      style={{

        maxWidth: 900,

        margin: "40px auto",

        fontFamily: "Arial, sans-serif",

      }}

    >

      <h1 style={{ textAlign: "center", marginBottom: 20 }}>🎟️ Check-in App</h1>

  

      {!jwt ? (

        <button

          onClick={handleLogin}

          style={{

            margin: "20px auto",

            display: "block",

            padding: "10px 20px",

            background: "#0070f3",

            color: "#fff",

            border: "none",

            borderRadius: 4,

          }}

        >

          Login com Google

        </button>

      ) : (

        <button

          onClick={loadData}

          style={{

            float: "right",

            margin: 10,

            padding: "5px 10px",

            background: "#fff",

            color: "#0070f3",

            border: "1px solid #0070f3",

            borderRadius: 4,

          }}

        >

          Meu Perfil

        </button>

      )}

  

      {me && (

        <section

          style={{

            padding: 20,

            borderRadius: 6,

            marginBottom: 30,

          }}

        >

          <h2>👤 Perfil</h2>

          <p>

            <strong>Nome:</strong> {me.full_name}

          </p>

          <p>

            <strong>Email:</strong> {me.email}

          </p>

          <p>

            <strong>Data de nascimento:</strong>{" "}

            {me.date_of_birth

              ? new Date(me.date_of_birth).toLocaleDateString()

              : "-"}

          </p>

          <p>

            <strong>Ícone:</strong> {me.is_iconic ? "Sim" : "Não"}

          </p>

        </section>

      )}

  

      <section style={{ marginBottom: 30 }}>

        <h2>📅 Eventos</h2>

        {events.map((evt) => {

          const part = participations.find((p) => p.event_id === evt.id);

          return (

            <div

              key={evt.id}

              style={{

                display: "flex",

                justifyContent: "space-between",

                padding: 12,

                borderBottom: "1px solid #eee",

              }}

            >

              <strong>{evt.title}</strong>

              {part?.status === "confirmed" ? (

                <>

                  <button

                    onClick={() => cancelParticipation(evt.id)}

                    style={{

                      marginRight: 8,

                      padding: "5px 10px",

                      background: "#ff4081",

                      color: "#fff",

                      border: "none",

                      borderRadius: 4,

                    }}

                  >

                    Cancelar

                  </button>

                  <button

                    onClick={() => loadConfirmedUsers(evt.id)}

                    style={{

                      padding: "5px 10px",

                      background: "#2196f3",

                      color: "#fff",

                      border: "none",

                      borderRadius: 4,

                    }}

                  >

                    Confirmados

                  </button>

                </>

              ) : (

                <button

                  onClick={() => participateEvent(evt.id)}

                  style={{

                    padding: "5px 10px",

                    background: "#4caf50",

                    color: "#fff",

                    border: "none",

                    borderRadius: 4,

                  }}

                >

                  Participar

                </button>

              )}

            </div>

          );

        })}

      </section>

  

      {selectedEventId && (

        <section style={{ marginBottom: 30 }}>

          <h3>

            Evento: <em>{selectedEventId}</em>

          </h3>

          <div style={{ marginBottom: 15 }}>

            <button

              onClick={generateCheckin}

              style={{

                marginRight: 8,

                padding: "5px 10px",

                background: "#607d8b",

                color: "#fff",

                border: "none",

                borderRadius: 4,

              }}

            >

              Gerar QR Code

            </button>

            {qrImage && (

              <img

                src={qrImage}

                alt="QR Code"

                width={100}

                style={{

                  border: "2px solid #0070f3",

                  borderRadius: 4,

                }}

              />

            )}

          </div>

          <div>

            <h4>✅ Confirmados</h4>

            <div

              style={{

                display: "flex",

                gap: 20,

                flexWrap: "wrap",

              }}

            >

              {confirmedUsers.map((u) => (

                <div

                  key={u.id}

                  style={{

                    textAlign: "center",

                    width: 100,

                  }}

                >

                  <img

                    src={u.profile_picture_url || "/placeholder.png"}

                    alt="avatar"

                    width={60}

                    height={60}

                    style={{

                      borderRadius: "50%",

                      objectFit: "cover",

                      border: "2px solid #0070f3",

                    }}

                  />

                  <div

                    style={{

                      margin: "6px 0",

                      fontSize: 13,

                    }}

                  >

                    {u.nickname || "Anônimo"}

                  </div>

                </div>

              ))}

            </div>

            {(me.role === "admin" || me.role === "scanner") && (

              <div style={{ marginTop: 20 }}>

                <h4>👮 Scanner</h4>

                <button

                  onClick={() => setShowScanner(!showScanner)}

                  style={{

                    padding: "5px 10px",

                    background: "#9c27b0",

                    color: "#fff",

                    border: "none",

                    borderRadius: 4,

                  }}

                >

                  {showScanner ? "Fechar Scanner" : "Escanear QR"}

                </button>

                {showScanner && (

                  <div id="scanner" style={{ marginTop: 12, width: 300 }} />

                )}

              </div>

            )}

          </div>

        </section>

      )}

  

      {error && (

        <p

          style={{

            color: "#e53935",

            textAlign: "center",

            marginTop: 20,

          }}

        >

          {error}

        </p>

      )}

    </div>

  );

};

  

export default App;