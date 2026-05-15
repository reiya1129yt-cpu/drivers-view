"use client";

import { Fuel, ParkingCircle, Zap } from "lucide-react";
import type { PlaceType } from "@/lib/types";

interface FilterBarProps {
  selectedTypes: PlaceType[];
  onToggle: (type: PlaceType) => void;
}

const filters: { type: PlaceType; label: string; icon: React.ReactNode }[] = [
  { type: "gas_station", label: "GS", icon: <Fuel className="h-4 w-4" /> },
  {
    type: "pa_sa",
    label: "PA/SA",
    icon: <ParkingCircle className="h-4 w-4" />,
  },
  { type: "ev_charging", label: "EV", icon: <Zap className="h-4 w-4" /> },
];

const typeColors: Record<PlaceType, { active: string; inactive: string }> = {
  gas_station: {
    active: "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/30",
    inactive:
      "bg-card/80 text-card-foreground border-border hover:bg-card",
  },
  pa_sa: {
    active: "bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/30",
    inactive:
      "bg-card/80 text-card-foreground border-border hover:bg-card",
  },
  ev_charging: {
    active: "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/30",
    inactive:
      "bg-card/80 text-card-foreground border-border hover:bg-card",
  },
};

export default function FilterBar({ selectedTypes, onToggle }: FilterBarProps) {
  return (
    <div className="flex gap-2">
      {filters.map(({ type, label, icon }) => {
        const isSelected = selectedTypes.includes(type);
        return (
          <button
            key={type}
            onClick={() => onToggle(type)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              isSelected ? typeColors[type].active : typeColors[type].inactive
            }`}
          >
            {icon}
            {label}
          </button>
        );
      })}
    </div>
  );
}
