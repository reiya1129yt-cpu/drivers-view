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
  Car,
  Gauge,
  Clock,
  CircleDot,
  Users,
  Toilet,
  AlertTriangle,
  Share2,
} from "lucide-react";
import type { PlaceWithPrices, FuelType } from "@/lib/types";
import {
  FUEL_TYPE_LABELS,
  PLACE_TYPE_LABELS,
  BUSINESS_STATUS_LABELS,
  CONGESTION_LABELS,
  CONGESTION_COLORS,
} from "@/lib/types";
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

const StatusColors: Record<string, string> = {
  open: "text-green-400",
  closed: "text-red-400",
  outside_hours: "text-yellow-400",
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

  const handleShare = async () => {
    const shareData = {
      title: place.name,
      text: `${place.name} - ${PLACE_TYPE_LABELS[place.place_type]}`,
      url: window.location.href,
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
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

          {/* Distance & Address */}
          <div className="mb-4 space-y-1">
            {distance !== undefined && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">現在地から {formatDistance(distance)}</span>
              </div>
            )}
            {place.address && (
              <p className="text-sm text-muted-foreground pl-6">{place.address}</p>
            )}
          </div>

          {/* Business Status & Hours */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-xl bg-secondary p-3">
              <div className="flex items-center gap-2 mb-1">
                <CircleDot className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">営業状態</span>
              </div>
              <p className={`font-semibold ${StatusColors[place.business_status || "open"]}`}>
                {BUSINESS_STATUS_LABELS[place.business_status || "open"]}
              </p>
            </div>
            <div className="rounded-xl bg-secondary p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">営業時間</span>
              </div>
              <p className="font-semibold text-card-foreground">
                {place.business_hours || "不明"}
              </p>
            </div>
          </div>

          {/* Facilities (GS and PA/SA) */}
          {(place.place_type === "gas_station" || place.place_type === "pa_sa") && (
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="rounded-xl bg-secondary p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">洗車機</span>
                </div>
                <p className={`font-semibold ${place.has_car_wash ? "text-green-400" : "text-muted-foreground"}`}>
                  {place.has_car_wash ? "あり" : "なし"}
                </p>
              </div>
              <div className="rounded-xl bg-secondary p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">タイヤ空気圧</span>
                </div>
                <p className={`font-semibold ${place.has_tire_pressure ? "text-green-400" : "text-muted-foreground"}`}>
                  {place.has_tire_pressure ? "あり" : "なし"}
                </p>
              </div>
            </div>
          )}

          {/* PA/SA Specific Info */}
          {place.place_type === "pa_sa" && (
            <div className="grid grid-cols-3 gap-2 mb-5">
              <div className="rounded-xl bg-secondary p-3">
                <div className="flex items-center gap-1 mb-1">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">混雑状況</span>
                </div>
                <p className={`font-semibold text-sm ${CONGESTION_COLORS[place.congestion_level || "normal"]}`}>
                  {CONGESTION_LABELS[place.congestion_level || "normal"]}
                </p>
              </div>
              <div className="rounded-xl bg-secondary p-3">
                <div className="flex items-center gap-1 mb-1">
                  <Toilet className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">トイレ</span>
                </div>
                <p className={`font-semibold text-sm ${place.toilet_available !== false ? "text-green-400" : "text-red-400"}`}>
                  {place.toilet_available !== false ? "利用可" : "利用不可"}
                </p>
              </div>
              <div className="rounded-xl bg-secondary p-3">
                <div className="flex items-center gap-1 mb-1">
                  <AlertTriangle className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">閉鎖情報</span>
                </div>
                <p className={`font-semibold text-sm ${place.is_closed ? "text-red-400" : "text-green-400"}`}>
                  {place.is_closed ? "閉鎖中" : "通常営業"}
                </p>
              </div>
            </div>
          )}

          {/* Fuel Prices (for gas stations and PA/SA) */}
          {(place.place_type === "gas_station" || place.place_type === "pa_sa") && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-card-foreground">燃料価格</h3>
                {isLoggedIn && place.place_type === "gas_station" && (
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
              {!isLoggedIn && place.place_type === "gas_station" && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  価格を投稿するにはログインが必要です
                </p>
              )}
            </div>
          )}

          {/* EV Charging specific */}
          {place.place_type === "ev_charging" && (
            <div className="mb-5">
              <h3 className="font-semibold text-card-foreground mb-3">充電タイプ</h3>
              <div className="flex flex-wrap gap-2">
                {place.amenities?.map((amenity) => (
                  <span
                    key={amenity}
                    className="rounded-full bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 text-sm text-blue-400"
                  >
                    {amenity}
                  </span>
                )) || (
                  <>
                    <span className="rounded-full bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 text-sm text-blue-400">
                      急速充電
                    </span>
                    <span className="rounded-full bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 text-sm text-blue-400">
                      普通充電
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Amenities / Services */}
          {place.amenities && place.amenities.length > 0 && place.place_type !== "ev_charging" && (
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
              onClick={handleShare}
              className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3.5 font-semibold text-card-foreground transition-colors hover:bg-secondary"
            >
              <Share2 className="h-5 w-5" />
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
