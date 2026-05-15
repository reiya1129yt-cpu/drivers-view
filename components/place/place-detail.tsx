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
  MapPin,
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
  distance?: number;
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
  distance,
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

  const formatDistance = (d: number) => {
    if (d < 1) {
      return `${Math.round(d * 1000)}m`;
    }
    return `${d.toFixed(1)}km`;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60">
      {/* Tap outside to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Bottom sheet container - positioned above bottom nav */}
      <div className="w-full max-h-[85vh] rounded-t-2xl bg-card shadow-2xl flex flex-col mb-14 sm:mb-0 sm:max-w-lg sm:mx-auto sm:rounded-2xl sm:m-4">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`rounded-full p-3 text-white ${PlaceTypeColors[place.place_type]}`}
              >
                <PlaceTypeIcon type={place.place_type} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-card-foreground leading-tight">
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
              className="rounded-full p-2 hover:bg-secondary transition-colors -mr-2 -mt-1"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Distance */}
          {distance !== undefined && (
            <div className="flex items-center gap-2 mb-4 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">現在地から {formatDistance(distance)}</span>
            </div>
          )}

          {/* Address */}
          {place.address && (
            <p className="text-sm text-muted-foreground mb-4">{place.address}</p>
          )}

          {/* Fuel Prices (for gas stations) */}
          {place.place_type === "gas_station" && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-card-foreground">燃料価格</h3>
                {isLoggedIn && (
                  <button
                    onClick={() => setShowPriceForm(true)}
                    className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium"
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
                      className="rounded-xl bg-secondary p-3 text-center"
                    >
                      <p className="text-xs text-muted-foreground mb-1">
                        {FUEL_TYPE_LABELS[fuelType]}
                      </p>
                      <p className="text-xl font-bold text-card-foreground">
                        {price ? (
                          <>
                            ¥{price}
                            <span className="text-sm font-normal text-muted-foreground">/L</span>
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
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  価格を投稿するにはログインが必要です
                </p>
              )}
            </div>
          )}

          {/* Amenities / Services */}
          {place.amenities && place.amenities.length > 0 && (
            <div className="mb-5">
              <h3 className="font-semibold text-card-foreground mb-3">設備・サービス</h3>
              <div className="flex flex-wrap gap-2">
                {place.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="rounded-full bg-secondary px-3 py-1.5 text-sm text-secondary-foreground"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-border">
            <button
              onClick={() => onNavigate(place)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Navigation className="h-5 w-5" />
              ナビ開始
            </button>
            <button
              onClick={openInMaps}
              className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3.5 font-semibold text-card-foreground transition-colors hover:bg-secondary"
            >
              <ExternalLink className="h-5 w-5" />
            </button>
          </div>

          {/* Price Post Form */}
          {showPriceForm && (
            <div className="mt-6">
              <PricePostForm
                place={place}
                onClose={() => setShowPriceForm(false)}
                onSuccess={handlePricePosted}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
