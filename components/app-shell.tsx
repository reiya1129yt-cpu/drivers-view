"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import BottomNav from "@/components/bottom-nav";
import MapScreen from "@/components/map-screen";
import PostScreen from "@/components/post-screen";
import MoreScreen from "@/components/more-screen";
import { MOCK_STATIONS } from "@/lib/mock-data";
import type { GasStation } from "@/lib/types";

type Tab = "map" | "post" | "more";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
};

export default function AppShell() {
  const [activeTab, setActiveTab]   = useState<Tab>("map");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { data: stations = MOCK_STATIONS } = useSWR<GasStation[]>(
    "/api/gas-stations",
    fetcher,
    { fallbackData: MOCK_STATIONS, refreshInterval: 30000 }
  );

  const handleLocationFound = useCallback((latlng: { lat: number; lng: number }) => {
    setUserLocation(latlng);
  }, []);

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
  }, []);

  return (
    <main style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "#0f1117", overflow: "hidden" }}>
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {/* Map always mounted — keeps Leaflet alive across tab switches */}
        <div style={{ position: "absolute", inset: 0, display: activeTab === "map" ? "block" : "none" }}>
          <MapScreen stations={stations} onLocationFound={handleLocationFound} />
        </div>

        {activeTab === "post" && (
          <div style={{ position: "absolute", inset: 0 }}>
            <PostScreen />
          </div>
        )}

        {activeTab === "more" && (
          <div style={{ position: "absolute", inset: 0, overflowY: "auto" }}>
            <MoreScreen />
          </div>
        )}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </main>
  );
}
