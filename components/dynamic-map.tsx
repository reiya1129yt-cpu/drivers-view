"use client";

import dynamic from "next/dynamic";
import type { GasStation } from "@/lib/types";

// Dynamically import the LeafletMap component with SSR disabled
// This is REQUIRED for Leaflet to work in Next.js because:
// 1. Leaflet requires the window object which doesn't exist on the server
// 2. Without this, you'll get "Object is not a constructor" errors
const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1a1d27",
        minHeight: "400px",
        height: "100%",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", color: "#6b7280" }}>
        <svg
          style={{ width: 32, height: 32, animation: "spin 1s linear infinite" }}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" stroke="#2a2f42" strokeWidth="4" />
          <path d="M4 12a8 8 0 018-8" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: 14 }}>マップを読み込み中...</span>
      </div>
    </div>
  ),
});

interface DynamicMapProps {
  center?: [number, number];
  zoom?: number;
  showUserLocation?: boolean;
  stations: GasStation[];
  onLocationFound: (latlng: { lat: number; lng: number }) => void;
  flyToLocation?: [number, number] | null;
  className?: string;
}

export default function DynamicMap(props: DynamicMapProps) {
  return <LeafletMap {...props} />;
}
