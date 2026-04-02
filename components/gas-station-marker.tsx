"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { GasStation, FuelType } from "@/lib/types";
import { FUEL_TYPE_LABELS, FUEL_TYPE_COLORS } from "@/lib/types";

// Create custom colored markers for different fuel types
function createFuelIcon(fuelType: FuelType) {
  const color = FUEL_TYPE_COLORS[fuelType];

  return L.divIcon({
    className: "custom-fuel-marker",
    html: `
      <div style="
        background: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 11px;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        ">
          ${fuelType === "regular" ? "R" : fuelType === "high_octane" ? "H" : "D"}
        </span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}

interface GasStationMarkerProps {
  station: GasStation;
}

export default function GasStationMarker({ station }: GasStationMarkerProps) {
  const icon = createFuelIcon(station.fuel_type);

  return (
    <Marker position={[station.latitude, station.longitude]} icon={icon}>
      <Popup>
        <div className="min-w-48 p-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-base text-foreground leading-tight">
              {station.station_name}
            </h3>
            <span
              className="text-lg font-bold whitespace-nowrap"
              style={{ color: FUEL_TYPE_COLORS[station.fuel_type] }}
            >
              ${station.price.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: FUEL_TYPE_COLORS[station.fuel_type] }}
            >
              {FUEL_TYPE_LABELS[station.fuel_type]}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(station.reported_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
