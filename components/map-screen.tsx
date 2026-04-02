"use client";

import { useState } from "react";
import DynamicMap from "@/components/dynamic-map";
import type { FuelType, GasStation } from "@/lib/types";
import { FUEL_TYPE_LABELS, FUEL_TYPE_COLORS } from "@/lib/types";

interface MapScreenProps {
  stations: GasStation[];
  onLocationFound: (latlng: { lat: number; lng: number }) => void;
}

type FilterType = FuelType | "all";

const FILTERS: { id: FilterType; label: string }[] = [
  { id: "all",         label: "すべて" },
  { id: "regular",     label: FUEL_TYPE_LABELS.regular },
  { id: "high_octane", label: FUEL_TYPE_LABELS.high_octane },
  { id: "diesel",      label: FUEL_TYPE_LABELS.diesel },
  { id: "ev_charging", label: FUEL_TYPE_LABELS.ev_charging },
];

export default function MapScreen({ stations, onLocationFound }: MapScreenProps) {
  const [selectedFuel, setSelectedFuel] = useState<FilterType>("all");

  const filteredStations =
    selectedFuel === "all" ? stations : stations.filter((s) => s.fuel_type === selectedFuel);

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      {/* Fuel filter bar */}
      <div
        suppressHydrationWarning
        style={{
          position: "absolute", top: 16, left: 12, right: 12, zIndex: 1000,
          display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2,
          scrollbarWidth: "none",
        }}
      >
        {FILTERS.map((f) => {
          const isActive = selectedFuel === f.id;
          const color = f.id !== "all" ? FUEL_TYPE_COLORS[f.id as FuelType] : "#22c55e";
          const count = f.id === "all" ? stations.length : stations.filter((s) => s.fuel_type === f.id).length;
          return (
            <button
              key={f.id}
              onClick={() => setSelectedFuel(f.id)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px",
                borderRadius: 999,
                border: `1.5px solid ${isActive ? color : "#2a2f42"}`,
                background: isActive ? `${color}22` : "rgba(26,29,39,0.92)",
                color: isActive ? color : "#9ca3af",
                fontSize: 13, fontWeight: 600,
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                backdropFilter: "blur(8px)",
                boxShadow: isActive ? `0 2px 12px ${color}33` : "0 2px 6px rgba(0,0,0,0.4)",
                transition: "all 0.15s",
              }}
            >
              {f.id !== "all" && (
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "block", flexShrink: 0 }} />
              )}
              {f.label}
              <span style={{
                fontSize: 11, fontWeight: 700,
                background: isActive ? `${color}33` : "#22263a",
                color: isActive ? color : "#6b7280",
                padding: "1px 6px", borderRadius: 999,
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Map — always mounted, filter applied by passing filtered stations */}
      <DynamicMap
        stations={filteredStations}
        onLocationFound={onLocationFound}
        fuelFilter={selectedFuel}
      />
    </div>
  );
}
