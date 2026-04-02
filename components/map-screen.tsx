"use client";

import { useState } from "react";
import DynamicMap from "@/components/dynamic-map";
import type { FuelType, GasStation } from "@/lib/types";
import { FUEL_TYPE_LABELS, FUEL_TYPE_COLORS } from "@/lib/types";

interface MapScreenProps {
  stations: GasStation[];
  onLocationFound: (latlng: { lat: number; lng: number }) => void;
}

export default function MapScreen({ stations, onLocationFound }: MapScreenProps) {
  const [selectedFuel, setSelectedFuel] = useState<FuelType | "all">("all");
  const [flyToLocation, setFlyToLocation] = useState<[number, number] | null>(null);

  const fuelTypes: Array<{ id: FuelType | "all"; label: string; color?: string }> = [
    { id: "all", label: "すべて" },
    { id: "regular", label: FUEL_TYPE_LABELS.regular, color: FUEL_TYPE_COLORS.regular },
    { id: "high_octane", label: FUEL_TYPE_LABELS.high_octane, color: FUEL_TYPE_COLORS.high_octane },
    { id: "diesel", label: FUEL_TYPE_LABELS.diesel, color: FUEL_TYPE_COLORS.diesel },
  ];

  const filteredStations =
    selectedFuel === "all"
      ? stations
      : stations.filter((s) => s.fuel_type === selectedFuel);

  return (
    <div className="relative h-full w-full">
      {/* Fuel type switcher */}
      <div
        className="absolute top-4 left-4 right-4 z-10 flex gap-2 overflow-x-auto"
        style={{
          paddingBottom: "2px", // For scrollbar space
        }}
      >
        {fuelTypes.map((fuel) => {
          const isActive = selectedFuel === fuel.id;
          return (
            <button
              key={fuel.id}
              onClick={() => setSelectedFuel(fuel.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0"
              style={{
                background: isActive ? "#22263a" : "#1a1d27",
                color: isActive ? "#f0f2f5" : "#6b7280",
                border: isActive ? `1px solid ${fuel.color || "#2a2f42"}` : "1px solid #2a2f42",
                boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
              }}
            >
              {fuel.color && (
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ background: fuel.color }}
                />
              )}
              <span>{fuel.label}</span>
              {fuel.id !== "all" && (
                <span
                  className="px-1.5 py-0.5 rounded text-xs font-semibold"
                  style={{
                    background: isActive ? (fuel.color + "33") : "#22263a",
                    color: fuel.color,
                  }}
                >
                  {stations.filter((s) => s.fuel_type === fuel.id).length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Map */}
      <DynamicMap
        center={[35.6762, 139.6503]}
        zoom={12}
        showUserLocation={true}
        stations={filteredStations}
        onLocationFound={onLocationFound}
        flyToLocation={flyToLocation}
        className="absolute inset-0"
      />
    </div>
  );
}
