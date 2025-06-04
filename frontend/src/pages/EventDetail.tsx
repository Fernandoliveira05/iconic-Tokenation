import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Calendar, Clock, MapPin, QrCode, Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@suiet/wallet-kit";
import { usePaywall } from "@/lib/sui";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { UserGrid } from "@/components/UserGrid";
import Modal from "@/components/modal";
import { BecomeIconicCard } from "@/components/BecomeIconicCard";
import placeholderEvent from "@/assets/placeholder_event.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface EventDetail {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  is_exclusive: boolean;
  cover_image_url: string;
  partner_name?: string;
  partner_logo_url?: string;
  max_attendees: number;
  current_attendees: number;
  is_participating: boolean;
  participation_id?: string;
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isIconic, token } = useAuth();
  const { connected, connect } = useWallet();
  const { payFee } = usePaywall();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  const [becomeOpen, setBecomeOpen] = useState(false);
  const [becomeWaiting, setBecomeWaiting] = useState(false);

  // Load event details
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data } = await api.get<EventDetail>(`/events/${id}`);
        setEvent(data);
      } catch {
        toast.error("Failed to load event details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Load check-in status
  useEffect(() => {
    if (!event) return;
    (async () => {
      try {
        const { data } = await api.get<{ checkedIn: boolean }>(
          `/event-checkins/event/${id}/user/${user.id}/checked`
        );
        setCheckedIn(data.checkedIn);
      } catch {
        // ignore
      }
    })();
  }, [event, id, user.id]);

  // RSVP handler
  const handleJoin = async () => {
    if (!event || processing) return;

    // If exclusive and not ICONIC, show BecomeIconic modal
    if (event.is_exclusive && !isIconic) {
      setBecomeOpen(true);
      return;
    }

    setProcessing(true);
    try {
      const { data } = await api.post<{ id: string }>(`/event-participations`, {
        event_id: event.id,
        status: "confirmed",
      });
      setEvent((e) =>
        e
          ? {
              ...e,
              is_participating: true,
              participation_id: data.id,
              current_attendees: e.current_attendees + 1,
            }
          : e
      );
      toast.success("Registration confirmed!");
    } catch (err: any) {
      if (err.response?.status === 409) {
        toast.info("You're already registered.");
      } else {
        toast.error("Failed to register. Please try again.");
      }
    } finally {
      setProcessing(false);
    }
  };

  // Cancel RSVP
  const handleCancel = async () => {
    if (!event?.participation_id || processing) return;
    setProcessing(true);
    try {
      await api.patch(`/event-participations/${event.participation_id}`, {
        status: "cancelled",
      });
      setEvent((e) =>
        e
          ? {
              ...e,
              is_participating: false,
              participation_id: undefined,
              current_attendees: e.current_attendees - 1,
            }
          : e
      );
      setCheckedIn(false);
      toast.success("RSVP cancelled.");
    } catch {
      toast.error("Failed to cancel RSVP. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // Become ICONIC handler
  const handleBecome = async () => {
    if (!connected) {
      await connect();
      return;
    }
    setBecomeWaiting(true);
    try {
      const txId = await payFee(0.1);
      const res = await api.post(
        `/users/iconic/${user!.id}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            "X-Transaction-Id": txId,
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.status === 200) {
        toast.success("You are now ICONIC!");
        setBecomeOpen(false);
      } else {
        toast.error("Subscription failed.");
      }
    } catch {
      toast.error("Subscription error. Please try again.");
    } finally {
      setBecomeWaiting(false);
    }
  };

  // New “Bippar” handler
  const handleBip = () => {
    if (event) {
      navigate(`/events/${event.id}/bip`);
    }
  };

  if (loading || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading event...</p>
        <ToastContainer position="top-center" autoClose={4000} />
      </div>
    );
  }

  const dt = new Date(event.date);
  const dateStr = dt.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = dt.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const role = user?.role.toLowerCase() ?? "";
  const canScan = ["admin", "scanner"].includes(role);
  const canBip = ["admin", "bipper"].includes(role);
  const seatsLeft = event.max_attendees - event.current_attendees;
  const soldOut = seatsLeft <= 0;

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
        <Header />
        <main className="flex-1 overflow-auto pb-24">
          <div className="relative">
            <img
              src={event.cover_image_url}
              onError={(e) => (e.currentTarget.src = placeholderEvent)}
              alt={event.title}
              className="w-full h-72 md:h-96 object-cover"
            />
            {soldOut ? (
              <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 text-sm font-semibold rounded animate-pulse">
                Sold Out
              </div>
            ) : (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-3 py-1 text-sm font-semibold rounded animate-gradient-pan">
                {seatsLeft} seats left
              </div>
            )}
            {checkedIn && (
              <div className="absolute top-4 right-4 bg-white bg-opacity-80 text-gray-900 px-3 py-1 text-sm font-medium uppercase rounded">
                Access Granted
              </div>
            )}
          </div>

          <div className="px-4 md:px-8 lg:px-16 pt-6 space-y-6 md:max-w-3xl md:mx-auto">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary">
              {event.title}
            </h1>
            {event.partner_logo_url && (
              <div className="flex items-center space-x-3 justify-center">
                <img
                  src={event.partner_logo_url}
                  onError={(e) => (e.currentTarget.src = placeholderEvent)}
                  alt={event.partner_name}
                  className="w-10 h-10 rounded-full"
                />
                <span className="text-sm text-gray-600">
                  Partner: {event.partner_name}
                </span>
              </div>
            )}
            <p className="text-lg text-gray-700 text-center">
              {event.description}
            </p>

            <div className="flex flex-wrap gap-6 text-gray-500 justify-center">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> {dateStr}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> {timeStr}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> {event.location}
              </span>
            </div>

            <div className="text-center text-sm font-medium text-gray-600">
              {soldOut ? (
                <span className="text-red-600">This event is sold out.</span>
              ) : (
                <span>
                  Only <span className="font-semibold">{seatsLeft}</span> seats
                  remaining
                </span>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {!event.is_participating && !soldOut ? (
                <button
                  onClick={handleJoin}
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 text-white font-bold py-3 rounded-full shadow-lg transition hover:brightness-110 disabled:opacity-50"
                >
                  {processing ? "Joining..." : "RSVP Now"}
                </button>
              ) : (
                <>
                  {!checkedIn && (
                    <button
                      onClick={() => navigate(`/events/${event.id}/checkin`)}
                      className="w-full flex items-center justify-center bg-gradient-to-r from-yellow-500 to-red-500 text-white font-semibold py-3 rounded-full shadow transition hover:brightness-110"
                    >
                      <QrCode className="w-5 h-5 mr-2" /> Get Access QR
                    </button>
                  )}
                  {canScan && (
                    <button
                      onClick={() => navigate(`/events/${event.id}/scan`)}
                      className="w-full flex items-center justify-center bg-white border-2 border-primary text-primary font-semibold py-3 rounded-full shadow transition hover:bg-primary/10"
                    >
                      <Camera className="w-5 h-5 mr-2" /> Scanner Mode
                    </button>
                  )}
                  {canBip && (
                    <button
                      onClick={handleBip}
                      className="w-full flex items-center justify-center bg-blue-600 text-white font-semibold py-3 rounded-full shadow transition hover:brightness-110"
                    >
                      Bippar
                    </button>
                  )}
                  {!checkedIn && (
                    <button
                      onClick={handleCancel}
                      disabled={processing}
                      className="w-full text-center text-sm text-gray-500 underline disabled:opacity-50"
                    >
                      {processing ? "Cancelling..." : "Cancel RSVP"}
                    </button>
                  )}
                </>
              )}
            </div>

            {event.is_participating && (
              <section className="mt-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
                  Confirmed Attendees
                </h2>
                <UserGrid
                  endpoint={`/event-participations/event/${event.id}/confirmed-users`}
                />
              </section>
            )}
          </div>
        </main>
        <BottomNav />
      </div>

      {/* Become ICONIC Modal */}
      <Modal open={becomeOpen} onClose={() => setBecomeOpen(false)}>
        <BecomeIconicCard
          connected={connected}
          connect={connect}
          waiting={becomeWaiting}
          onSubscribe={handleBecome}
          feeAmount={0.1}
          networkName="Sui Testnet"
        />
      </Modal>

      <ToastContainer position="top-center" autoClose={4000} />

      <style>{`
        @keyframes gradient-pan {
          0%,100% { background-position:0% 50%; }
          50%     { background-position:100% 50%; }
        }
        .animate-gradient-pan {
          background-size:200% 200%;
          animation:gradient-pan 4s linear infinite;
        }
      `}</style>
    </>
  );
}
