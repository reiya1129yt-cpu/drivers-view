"use client";

import { useState } from "react";
import {
  X,
  Navigation,
  Fuel,
  ParkingCircle,
  Zap,
  Plus,
  ExternalLink,
} from "lucide-react";
import type { PlaceWithPrices, FuelType } from "@/lib/types";
import { FUEL_TYPE_LABELS, PLACE_TYPE_LABELS } from "@/lib/types";
import PricePostForm from "./price-post-form";

interface PlaceDetailProps {
  place: PlaceWithPrices;
  onClose: () => void;
  onNavigate: (place: PlaceWithPrices) => void;
  isLoggedIn: boolean;
  onPricePosted?: () => void;
}

const PlaceTypeIcon = ({ type }: { type: PlaceWithPrices["place_type"] }) => {
  const iconProps = { className: "h-6 w-6" };
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

export default function PlaceDetail({
  place,
  onClose,
  onNavigate,
  isLoggedIn,
  onPricePosted,
}: PlaceDetailProps) {
  const [showPriceForm, setShowPriceForm] = useState(false);
  const fuelTypes: FuelType[] = ["regular", "high_octane", "diesel", "kerosene"];

  const openInMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
    window.open(url, "_blank");
  };

  const handlePricePosted = () => {
    setShowPriceForm(false);
    onPricePosted?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="w-full max-w-lg rounded-t-2xl bg-card p-6 shadow-xl sm:rounded-2xl sm:m-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-full p-3 text-white ${PlaceTypeColors[place.place_type]}`}
            >
              <PlaceTypeIcon type={place.place_type} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-card-foreground">
                {place.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {PLACE_TYPE_LABELS[place.place_type]}
                {place.brand && ` - ${place.brand}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-secondary transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {place.address && (
          <p className="text-sm text-muted-foreground mb-4">{place.address}</p>
        )}

        {place.place_type === "gas_station" && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-card-foreground">燃料価格</h3>
              {isLoggedIn && (
                <button
                  onClick={() => setShowPriceForm(true)}
                  className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                >
                  <Plus className="h-4 w-4" />
                  価格を投稿
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {fuelTypes.map((fuelType) => {
                const price = place.latest_prices[fuelType];
                return (
                  <div
                    key={fuelType}
                    className="rounded-lg bg-secondary p-3 text-center"
                  >
                    <p className="text-sm text-muted-foreground">
                      {FUEL_TYPE_LABELS[fuelType]}
                    </p>
                    <p className="text-xl font-bold text-card-foreground">
                      {price ? (
                        <>
                          ¥{price}
                          <span className="text-sm font-normal">/L</span>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">未登録</span>
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
            {!isLoggedIn && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                価格を投稿するにはログインが必要です
              </p>
            )}
          </div>
        )}

        {place.amenities && place.amenities.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-card-foreground mb-2">設備</h3>
            <div className="flex flex-wrap gap-2">
              {place.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onNavigate(place)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Navigation className="h-5 w-5" />
            ナビ開始
          </button>
          <button
            onClick={openInMaps}
            className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 font-medium text-card-foreground transition-colors hover:bg-secondary"
          >
            <ExternalLink className="h-5 w-5" />
            Google Maps
          </button>
        </div>

        {showPriceForm && (
          <PricePostForm
            place={place}
            onClose={() => setShowPriceForm(false)}
            onSuccess={handlePricePosted}
          />
        )}
      </div>
    </div>
  );
}
