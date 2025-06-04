// src/pages/Home.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useEvents, EventsProvider, Event } from "@/contexts/EventsContext";
import { EventCard } from "@/components/EventCard";
import { BecomeIconicCard } from "@/components/BecomeIconicCard";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@suiet/wallet-kit";
import { usePaywall } from "@/lib/sui";
import Modal from "@/components/modal";
import { api } from "@/lib/api";
import { UserGrid } from "@/components/UserGrid";
import type { User } from "@/components/UserGrid";

/* viewport caps & flags */
const useCaps = () => {
  const calc = () => {
    const w = window.innerWidth;
    return {
      ev: w < 640 ? 2 : w < 1024 ? 3 : 2,
      ic: w < 640 ? 2 : 4,
      mobile: w < 640,
    };
  };
  const [caps, setCaps] = useState(calc());
  useEffect(() => {
    const onResize = () => setCaps(calc());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return caps;
};

export default function Home() {
  return (
    <EventsProvider>
      <HomeContent />
    </EventsProvider>
  );
}

function HomeContent() {
  const { ev, ic, mobile } = useCaps();
  const navigate = useNavigate();

  /* EVENTS */
  const { events, loading, error, participate } = useEvents();
  const visibleEvents = useMemo(() => events.slice(0, ev), [events, ev]);

  /* AUTH / WALLET */
  const { isIconic, user, token, refresh } = useAuth();
  const { connected, connect } = useWallet();
  const { payFee } = usePaywall();
  const [waiting, setWaiting] = useState(false);
  const [showIconicModal, setShowIconicModal] = useState(false);

  /* ICONICS */
  const [iconics, setIconics] = useState<User[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await api.get<User[]>("/users/iconic");
      setIconics(data.filter((u) => u.profile_picture_url).slice(0, ic));
    })();
  }, [ic]);

  /* SUBSCRIBE FLOW */
  const subscribeIconic = async () => {
    if (!connected) {
      await connect();
      return;
    }
    setWaiting(true);
    try {
      const txId = await payFee(0.1);
      await fetch(`${import.meta.env.VITE_API_URL}/users/iconic/${user!.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Transaction-Id": txId,
          Authorization: `Bearer ${token}`,
        },
      });
      await refresh();
      setShowIconicModal(false);
    } finally {
      setWaiting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Removed internal scrolling so the scroll is on the page */}
      <main className="flex-1 pt-16 md:pt-20 pb-20 px-4 md:px-10 lg:px-14 space-y-6 max-w-7xl mx-auto">
        {/* EVENTS */}
        <section className="mt-2 md:mt-6">
          <h2 className="text-lg md:text-2xl font-semibold text-gray-700 mb-1 md:mb-2">
            Live Memorable Experiences
          </h2>

          {loading && (
            <p className="text-center text-gray-500 mt-2">Loading…</p>
          )}
          {error && <p className="text-center text-red-500 mt-2">{error}</p>}

          <div className="compact-event-grid grid gap-2 grid-cols-1 md:grid-cols-2 mt-3">
            {visibleEvents.map((evt) =>
              mobile ? (
                <div
                  key={evt.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/events/${evt.id}`)}
                >
                  <EventCard
                    event={evt}
                    canAccess
                    onIconicClick={() => {}}
                    onJoin={() => Promise.resolve()}
                  />
                </div>
              ) : (
                <EventCard
                  key={evt.id}
                  event={evt}
                  canAccess
                  onIconicClick={() => setShowIconicModal(true)}
                  onJoin={() => participate(evt.id)}
                />
              )
            )}
          </div>

          <div className="mt-2 flex justify-center">
            <Link
              to="/tickets"
              className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 transition"
            >
              Explore full calendar →
            </Link>
          </div>
        </section>

        {/* ICONIC MEMBERS */}
        <section className="mt-2 md:mt-4 relative">
          <h3 className="text-lg md:text-2xl font-semibold text-gray-700 mb-1">
            Meet Our ICONIC Members
          </h3>

          {iconics.length === 0 ? (
            <p className="text-center text-gray-500">No public profiles yet.</p>
          ) : (
            <div className="home-iconic-grid">
              <UserGrid endpoint="/users/iconic" />
            </div>
          )}

          {/* Notebook-only: sticky button above bottom nav */}
          <div
            className={`${
              mobile
                ? "mt-2 static"
                : "fixed bottom-24 left-1/2 transform -translate-x-1/2"
            } flex justify-center w-full max-w-7xl`}
          >
            {!isIconic ? (
              <button
                onClick={() => setShowIconicModal(true)}
                className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 transition"
              >
                Become ICONIC →
              </button>
            ) : (
              <Link
                to="/iconic-network"
                className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 transition"
              >
                Go to ICONIC Network →
              </Link>
            )}
          </div>
        </section>
      </main>

      {showIconicModal && (
        <Modal open onClose={() => setShowIconicModal(false)}>
          <BecomeIconicCard
            connected={connected}
            connect={connect}
            waiting={waiting}
            onSubscribe={subscribeIconic}
            feeAmount={0.1}
            networkName="Sui Testnet"
          />
        </Modal>
      )}

      <BottomNav />

      {/* page-specific overrides */}
      <style>{`
        /* mobile: hide details, shrink cards */
        .compact-event-grid .relative>img { display: none; }
        .compact-event-grid .flex-1 { padding: 0.35rem!important; }
        @media(max-width:639px) {
          .compact-event-grid .flex-1>p,
          .compact-event-grid .flex-1>div:nth-child(3),
          .compact-event-grid .flex-1>div.mt-1,
          .compact-event-grid .p-4>a,
          .compact-event-grid .p-4>button:first-child {
            display: none;
          }
        }

        /* desktop: maintain cover, tighten grid gap */
        @media(min-width:1024px) {
          .home-iconic-grid .relative img { object-fit: cover !important; }
          .home-iconic-grid .grid { gap: 0.4rem!important; }
          .home-iconic-grid .cursor-pointer { transform: scale(.55); }
        }
      `}</style>
    </div>
  );
}
