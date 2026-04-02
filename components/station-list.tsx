"use client";

import type { GasStation } from "@/lib/types";
import { FUEL_TYPE_LABELS, FUEL_TYPE_COLORS } from "@/lib/types";

interface StationListProps {
  stations: GasStation[];
  userLocation: { lat: number; lng: number } | null;
  onStationClick: (station: GasStation) => void;
  onClose: () => void;
}

// Calculate distance between two coordinates in miles
function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function StationList({
  stations,
  userLocation,
  onStationClick,
  onClose,
}: StationListProps) {
  // Sort by price, then add distance if user location is available
  const sortedStations = [...stations]
    .map((station) => ({
      ...station,
      distance: userLocation
        ? getDistance(
            userLocation.lat,
            userLocation.lng,
            station.latitude,
            station.longitude
          )
        : null,
    }))
    .sort((a, b) => a.price - b.price);

  return (
    <div className="fixed inset-0 bg-black/50 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-card w-full sm:max-w-md h-[80vh] sm:h-[600px] rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <h2 className="text-lg font-bold text-foreground">
            Nearby Gas Stations
          </h2>
          <button
            onClick={onClose}
            className="p-2 -m-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-2 border-b border-border bg-muted/50 shrink-0">
          <p className="text-xs text-muted-foreground text-center">
            Sorted by lowest price
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sortedStations.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No stations reported yet. Be the first!
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {sortedStations.map((station, index) => (
                <li key={station.id}>
                  <button
                    onClick={() => onStationClick(station)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{
                        backgroundColor: FUEL_TYPE_COLORS[station.fuel_type],
                      }}
                    >
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground truncate">
                          {station.station_name}
                        </span>
                        <span
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium text-white shrink-0"
                          style={{
                            backgroundColor: FUEL_TYPE_COLORS[station.fuel_type],
                          }}
                        >
                          {FUEL_TYPE_LABELS[station.fuel_type]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        {station.distance !== null && (
                          <>
                            <span>{station.distance.toFixed(1)} mi</span>
                            <span>-</span>
                          </>
                        )}
                        <span>
                          {new Date(station.reported_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div
                      className="text-xl font-bold shrink-0"
                      style={{ color: FUEL_TYPE_COLORS[station.fuel_type] }}
                    >
                      ${station.price.toFixed(2)}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
