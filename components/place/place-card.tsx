"use client";

import { Fuel, ParkingCircle, Zap, Navigation, Clock } from "lucide-react";
import type { PlaceWithPrices, FuelType } from "@/lib/types";
import { FUEL_TYPE_LABELS, PLACE_TYPE_LABELS } from "@/lib/types";

interface PlaceCardProps {
  place: PlaceWithPrices;
  onNavigate?: (place: PlaceWithPrices) => void;
  onShowDetail?: (place: PlaceWithPrices) => void;
  distance?: number;
}

const PlaceTypeIcon = ({ type }: { type: PlaceWithPrices["place_type"] }) => {
  const iconProps = { className: "h-5 w-5" };
  switch (type) {
    case "gas_station":
      return <Fuel {...iconProps} />;
    case "pa_sa":
      return <ParkingCircle {...iconProps} />;
    case "ev_charging":
      return <Zap {...iconProps} />;
  }
};

const PlaceTypeColors: Record<PlaceWithPrices["place_type"], string> = {
  gas_station: "bg-red-500",
  pa_sa: "bg-green-500",
  ev_charging: "bg-blue-500",
};

export default function PlaceCard({
  place,
  onNavigate,
  onShowDetail,
  distance,
}: PlaceCardProps) {
  const hasPrices = Object.keys(place.latest_prices).length > 0;
  const fuelTypes: FuelType[] = ["regular", "high_octane", "diesel", "kerosene"];

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}日前`;
    if (hours > 0) return `${hours}時間前`;
    return "最近";
  };

  return (
    <div
      className="rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer"
      onClick={() => onShowDetail?.(place)}
    >
      <div className="flex items-start gap-3">
        <div
          className={`rounded-full p-2 text-white ${PlaceTypeColors[place.place_type]}`}
        >
          <PlaceTypeIcon type={place.place_type} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-card-foreground truncate">
              {place.name}
            </h3>
            {distance !== undefined && (
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {formatDistance(distance)}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {PLACE_TYPE_LABELS[place.place_type]}
            {place.brand && ` - ${place.brand}`}
          </p>
          {place.address && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {place.address}
            </p>
          )}
        </div>
      </div>

      {place.place_type === "gas_station" && (
        <div className="mt-3">
          {hasPrices ? (
            <div className="grid grid-cols-2 gap-2">
              {fuelTypes.map((fuelType) => {
                const price = place.latest_prices[fuelType];
                if (!price) return null;
                return (
                  <div
                    key={fuelType}
                    className="rounded-md bg-secondary px-2 py-1 text-center"
                  >
                    <p className="text-xs text-muted-foreground">
                      {FUEL_TYPE_LABELS[fuelType]}
                    </p>
                    <p className="font-bold text-card-foreground">
                      ¥{price}
                      <span className="text-xs font-normal">/L</span>
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-md bg-secondary/50 px-3 py-2 text-center">
              <p className="text-sm text-muted-foreground">価格未登録</p>
            </div>
          )}
        </div>
      )}

      {place.latest_prices.updated_at && (
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatTime(place.latest_prices.updated_at)}</span>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate?.(place);
          }}
          className="flex flex-1 items-center justify-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Navigation className="h-4 w-4" />
          ナビ開始
        </button>
      </div>
    </div>
  );
}
