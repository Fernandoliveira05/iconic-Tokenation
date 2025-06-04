// src/pages/TicketsPage.tsx
import React, { useEffect, useState } from "react";
import { EventCard } from "@/components/EventCard";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@suiet/wallet-kit";
import { usePaywall } from "@/lib/sui";
import Modal from "@/components/modal";
import { BecomeIconicCard } from "@/components/BecomeIconicCard";

const tabList = [
  { key: "events", label: "Recommended Events" },
  { key: "my-tickets", label: "My Tickets" },
];

export default function TicketsPage() {
  const [tab, setTab] = useState<"events" | "my-tickets">("events");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { user, isIconic, token } = useAuth();
  const { connected, connect } = useWallet();
  const { payFee } = usePaywall();

  // Modal state to show BecomeIconicCard if user tries to join without access
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchEvents = async () => {
      try {
        const endpoint =
          tab === "events" ? "/events/recommended" : "/events/participating";
        const { data } = await api.get(endpoint);
        setEvents(data);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [tab]);

  // Become ICONIC flow
  const handleSubscribe = async () => {
    if (!connected) {
      await connect();
      return;
    }
    setWaiting(true);
    try {
      const txId = await payFee(0.1);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/users/iconic/${user!.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Transaction-Id": txId,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        }
      );
      if (res.ok) {
        window.location.reload();
      } else if (res.status === 403) {
        // Optional: show toast info here
      }
    } catch {
      // Optional: handle error here
    } finally {
      setWaiting(false);
    }
  };

  // Join event handler passed to EventCard
  // If user can't access (not iconic & event exclusive), open modal BecomeIconicCard
  const handleIconicClick = (evt: any) => {
    setSelectedEvent(evt);
  };

  const handleJoin = async (evt: any) => {
    try {
      // You should have a context or API call to register participation, example:
      await api.post("/event-participations", {
        event_id: evt.id,
        status: "confirmed",
      });
      // Refresh events to update participation status or show success toast elsewhere
      // For simplicity, reload page (or you can refetch events)
      window.location.reload();
    } catch (err) {
      // Handle error or toast here if needed
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 pt-16 pb-16">
      <Header />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-10 lg:px-16 lg:py-12 max-w-7xl mx-auto">
        <div className="flex gap-2 mb-6">
          {tabList.map((t) => {
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key as "events" | "my-tickets")}
                className={`flex-1 py-2 rounded-full font-semibold transition text-base outline-none focus:ring-2 focus:ring-primary/50 ${
                  isActive
                    ? "iconic-gradient text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
                style={isActive ? { boxShadow: "0 2px 20px 0 #A855F733" } : {}}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        {loading ? (
          <p className="text-center text-gray-500 mt-10">Loading…</p>
        ) : events.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">
            {tab === "events"
              ? "No recommended events at the moment."
              : "You haven't registered for any events yet."}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
            {events.map((evt) => (
              <EventCard
                key={evt.id}
                event={evt}
                canAccess={isIconic || !evt.is_exclusive}
                onIconicClick={handleIconicClick}
                onJoin={handleJoin}
              />
            ))}
          </div>
        )}
      </main>
      <BottomNav />

      {selectedEvent && (
        <Modal open onClose={() => setSelectedEvent(null)}>
          <BecomeIconicCard
            connected={connected}
            connect={connect}
            waiting={waiting}
            onSubscribe={handleSubscribe}
            feeAmount={0.1}
            networkName="Sui Testnet"
          />
        </Modal>
      )}

      <style>{`
        @keyframes gradient-pan {
          0%,100% {background-position:0% 50%;}
          50% {background-position:100% 50%;}
        }
        .iconic-gradient {
          background: linear-gradient(90deg, #A855F7, #EC4899, #A855F7, #FDE68A);
          background-size: 300% 300%;
          animation: gradient-pan 4s linear infinite;
        }
      `}</style>
    </div>
  );
}
