"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import useSWR, { SWRConfig } from "swr";
import BottomNav from "@/components/bottom-nav";
import MapScreen from "@/components/map-screen";
import PostScreen from "@/components/post-screen";
import MoreScreen from "@/components/more-screen";
import AuthModal, { type GuestProfile } from "@/components/auth-modal";
import GuestLoginPromo from "@/components/guest-login-promo";
import { MOCK_STATIONS, generateNearbyStations } from "@/lib/mock-data";
import { useFavorites } from "@/lib/use-favorites";
import { FUEL_TYPE_LABELS, FUEL_TYPE_COLORS } from "@/lib/types";
import type { GasStation } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

type Tab = "map" | "post" | "more";

export interface AuthUser {
  id: string;
  email?: string;
  nickname: string;
  prefecture: string;
  isGuest: boolean;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
};

export default function AppShell() {
  const [activeTab, setActiveTab]       = useState<Tab>("map");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [authUser, setAuthUser]         = useState<AuthUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Restore Supabase session on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthUser({
          id: session.user.id,
          email: session.user.email ?? undefined,
          nickname: session.user.user_metadata?.nickname ?? session.user.email?.split("@")[0] ?? "ユーザー",
          prefecture: session.user.user_metadata?.prefecture ?? "",
          isGuest: false,
        });
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthUser({
          id: session.user.id,
          email: session.user.email ?? undefined,
          nickname: session.user.user_metadata?.nickname ?? session.user.email?.split("@")[0] ?? "ユーザー",
          prefecture: session.user.user_metadata?.prefecture ?? "",
          isGuest: false,
        });
      } else {
        setAuthUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const isLoggedIn = !!authUser && !authUser.isGuest;
  const isGuest    = !!authUser?.isGuest;

  function handleGuestContinue(profile: GuestProfile) {
    setAuthUser({ id: `guest_${Date.now()}`, nickname: profile.nickname, prefecture: profile.prefecture, isGuest: true });
    setShowAuthModal(false);
  }

  function handleAuthSuccess() {
    setShowAuthModal(false);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setAuthUser(null);
  }

  const { data: dbStations } = useSWR<GasStation[]>("/api/gas-stations", fetcher, { refreshInterval: 60000 });

  const stations: GasStation[] = useMemo(() => {
    if (dbStations && dbStations.length > 0) return dbStations;
    if (userLocation) return generateNearbyStations(userLocation.lat, userLocation.lng);
    return MOCK_STATIONS;
  }, [dbStations, userLocation]);

  const { toggle, isFavorite, canAdd, alerts, dismissAlert } = useFavorites(stations);

  const handleLocationFound = useCallback((latlng: { lat: number; lng: number }) => {
    setUserLocation(latlng);
  }, []);

  return (
    <SWRConfig value={{
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 10000,
      onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
        // Never retry on 404 or 5xx; back off exponentially up to 3 attempts
        if (error?.status === 404) return;
        if (retryCount >= 3) return;
        setTimeout(() => revalidate({ retryCount }), Math.min(1000 * 2 ** retryCount, 30000));
      },
    }}>
    <main style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "#0f1117", overflow: "hidden" }}>
      {/* Price-change alert banners */}
      {alerts.length > 0 && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 9999, display: "flex", flexDirection: "column", gap: 4, padding: "8px 12px", pointerEvents: "none" }}>
          {alerts.map((a) => {
            const color = FUEL_TYPE_COLORS[a.fuelType as keyof typeof FUEL_TYPE_COLORS] ?? "#22c55e";
            const up    = a.newPrice > a.oldPrice;
            return (
              <div key={a.id} style={{
                background: "#1e2235", border: `1.5px solid ${color}55`,
                borderRadius: 12, padding: "10px 14px",
                display: "flex", alignItems: "center", gap: 10,
                boxShadow: "0 4px 20px rgba(0,0,0,0.55)",
                pointerEvents: "auto",
              }}>
                <svg viewBox="0 0 24 24" fill={color} style={{ width: 18, height: 18, flexShrink: 0 }}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <div style={{ flex: 1, fontSize: 13, color: "#f0f2f5" }}>
                  <span style={{ fontWeight: 700 }}>{a.stationName}</span>
                  {" "}の価格が{" "}
                  <span style={{ color: "#9ca3af" }}>¥{a.oldPrice}</span>
                  {" "}{up ? "→" : "→"}{" "}
                  <span style={{ color, fontWeight: 700 }}>¥{a.newPrice}</span>
                  {" "}{up ? "に値上がり" : "に値下がり"}しました
                </div>
                <button onClick={() => dismissAlert(a.id)} style={{
                  background: "none", border: "none", color: "#6b7280", cursor: "pointer", padding: 4, pointerEvents: "auto",
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 15, height: 15 }}>
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, display: activeTab === "map" ? "block" : "none" }}>
          <MapScreen
            stations={stations}
            onLocationFound={handleLocationFound}
            userLocation={userLocation}
            isFavorite={isLoggedIn ? isFavorite : () => false}
            canAddFavorite={isLoggedIn && canAdd}
            onToggleFavorite={isLoggedIn ? toggle : () => setShowAuthModal(true)}
          />
        </div>

        {activeTab === "post" && (
          <div style={{ position: "absolute", inset: 0 }}>
            <PostScreen
              userLocation={userLocation}
              nearbyStations={stations}
              isLoggedIn={isLoggedIn}
              isGuest={isGuest}
              authUser={authUser}
              onRequestLogin={() => setShowAuthModal(true)}
            />
          </div>
        )}

        {activeTab === "more" && (
          <div style={{ position: "absolute", inset: 0, overflowY: "auto" }}>
            <MoreScreen
              isLoggedIn={isLoggedIn}
              isGuest={isGuest}
              authUser={authUser}
              onRequestLogin={() => setShowAuthModal(true)}
              onLogout={handleLogout}
            />
          </div>
        )}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={useCallback((tab: Tab) => setActiveTab(tab), [])} />

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onGuestContinue={handleGuestContinue}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* Guest login promo — only for unauthenticated visitors, once per session */}
      {!authUser && !showAuthModal && (
        <GuestLoginPromo
          onLogin={() => setShowAuthModal(true)}
          onDismiss={() => {}}
        />
      )}
    </main>
    </SWRConfig>
  );
}
