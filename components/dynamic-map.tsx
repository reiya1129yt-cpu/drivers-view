"use client";

import dynamic from "next/dynamic";
import type { GasStation } from "@/lib/types";

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "#1a1d27", width: "100%", height: "100%",
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, color: "#6b7280" }}>
        <svg style={{ width: 32, height: 32, animation: "spin 1s linear infinite" }} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#2a2f42" strokeWidth="4" />
          <path d="M4 12a8 8 0 018-8" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: 14 }}>マップを読み込み中...</span>
      </div>
    </div>
  ),
});

interface DynamicMapProps {
  stations: GasStation[];
  onLocationFound: (latlng: { lat: number; lng: number }) => void;
  fuelFilter: string;
  flyTo?: { lat: number; lng: number; zoom?: number } | null;
}

export default function DynamicMap(props: DynamicMapProps) {
  return <LeafletMap {...props} />;
}
