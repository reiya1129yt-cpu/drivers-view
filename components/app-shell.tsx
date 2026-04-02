"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import BottomNav from "@/components/bottom-nav";
import MapScreen from "@/components/map-screen";
import PostScreen from "@/components/post-screen";
import MoreScreen from "@/components/more-screen";
import type { GasStation, GasStationInput } from "@/lib/types";

type Tab = "map" | "post" | "more";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
};

export default function AppShell() {
  const [activeTab, setActiveTab] = useState<Tab>("map");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { data: stations = [], mutate } = useSWR<GasStation[]>(
    "/api/gas-stations",
    fetcher,
    { refreshInterval: 30000 }
  );

  const handleLocationFound = useCallback((latlng: { lat: number; lng: number }) => {
    setUserLocation(latlng);
  }, []);

  const handleSubmitPrice = useCallback(async (data: GasStationInput) => {
    const response = await fetch("/api/gas-stations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to submit");
    await mutate();
  }, [mutate]);

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
  }, []);

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        background: "#0f1117",
        overflow: "hidden",
      }}
    >
      {/* Screen content — fills space above bottom nav */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {/* Map tab — always mounted so the map does not re-init on tab switch */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: activeTab === "map" ? "block" : "none",
          }}
        >
          <MapScreen
            stations={stations}
            onLocationFound={handleLocationFound}
          />
        </div>

        {/* Post tab */}
        {activeTab === "post" && (
          <div style={{ position: "absolute", inset: 0, overflowY: "auto" }}>
            <PostScreen
              userLocation={userLocation}
              onSubmit={handleSubmitPrice}
            />
          </div>
        )}

        {/* More tab */}
        {activeTab === "more" && (
          <div style={{ position: "absolute", inset: 0, overflowY: "auto" }}>
            <MoreScreen />
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </main>
  );
}
