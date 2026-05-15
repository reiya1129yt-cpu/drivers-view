"use client";

import { useState } from "react";
import { X, Fuel, Search, MapPin, Check, AlertCircle, Loader2 } from "lucide-react";
import type { PlaceWithPrices, FuelType } from "@/lib/types";
import { FUEL_TYPE_LABELS } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

interface PricePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  places: PlaceWithPrices[];
  userLocation: [number, number];
  userId: string;
  onSuccess?: () => void;
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
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

export default function PricePostModal({
  isOpen,
  onClose,
  places,
  userLocation,
  userId,
  onSuccess,
}: PricePostModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStation, setSelectedStation] = useState<PlaceWithPrices | null>(null);
  const [selectedFuelType, setSelectedFuelType] = useState<FuelType>("regular");
  const [price, setPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter gas stations only
  const gasStations = places
    .filter((p) => p.place_type === "gas_station")
    .map((p) => ({
      ...p,
      distance: calculateDistance(
        userLocation[0],
        userLocation[1],
        p.latitude,
        p.longitude
      ),
    }))
    .sort((a, b) => a.distance - b.distance);

  // Filter by search query
  const filteredStations = searchQuery
    ? gasStations.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.brand && s.brand.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : gasStations.slice(0, 10);

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const handleSubmit = async () => {
    if (!selectedStation || !price) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // Check if place exists in our database, if not, create it
      let placeId = selectedStation.id;
      
      if (selectedStation.id.startsWith("osm-")) {
        // This is an OSM place, we need to insert it first
        const { data: existingPlace } = await supabase
          .from("places")
          .select("id")
          .eq("osm_id", selectedStation.osm_id)
          .single();

        if (existingPlace) {
          placeId = existingPlace.id;
        } else {
          const { data: newPlace, error: insertError } = await supabase
            .from("places")
            .insert({
              osm_id: selectedStation.osm_id,
              name: selectedStation.name,
              place_type: selectedStation.place_type,
              latitude: selectedStation.latitude,
              longitude: selectedStation.longitude,
              address: selectedStation.address,
              brand: selectedStation.brand,
            })
            .select("id")
            .single();

          if (insertError) throw insertError;
          if (newPlace) placeId = newPlace.id;
        }
      }

      // Insert price post
      const { error: priceError } = await supabase.from("price_posts").insert({
        place_id: placeId,
        user_id: userId,
        fuel_type: selectedFuelType,
        price: parseInt(price),
      });

      if (priceError) throw priceError;

      // Increment user points
      await supabase.rpc("increment_points", {
        user_id: userId,
        amount: 10,
      });

      setSubmitSuccess(true);
      setPrice("");
      setSelectedStation(null);
      
      setTimeout(() => {
        setSubmitSuccess(false);
        onClose();
        onSuccess?.();
      }, 1500);
    } catch (err) {
      console.error("Error posting price:", err);
      setError("価格の投稿に失敗しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedStation(null);
    setPrice("");
    setError(null);
    setSubmitSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-t-2xl bg-card max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">価格を投稿</h2>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {submitSuccess ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 mb-4">
                <Check className="h-8 w-8 text-green-400" />
              </div>
              <p className="text-lg font-bold text-foreground">投稿完了！</p>
              <p className="text-muted-foreground">10ポイント獲得しました</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/20 border border-red-500/30 p-3 text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Station Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  ガソリンスタンドを選択
                </label>
                
                {selectedStation ? (
                  <div className="rounded-lg border border-primary bg-primary/5 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{selectedStation.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedStation.brand && `${selectedStation.brand} - `}
                          {formatDistance(
                            calculateDistance(
                              userLocation[0],
                              userLocation[1],
                              selectedStation.latitude,
                              selectedStation.longitude
                            )
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedStation(null)}
                        className="text-sm text-primary"
                      >
                        変更
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="スタンド名で検索..."
                        className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {filteredStations.length > 0 ? (
                        filteredStations.map((station) => (
                          <button
                            key={station.id}
                            onClick={() => setSelectedStation(station)}
                            className="w-full flex items-center gap-3 rounded-lg border border-border p-3 text-left hover:bg-secondary transition-colors"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white">
                              <Fuel className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">{station.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {station.brand && `${station.brand} - `}
                                {formatDistance(station.distance)}
                              </p>
                            </div>
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                          </button>
                        ))
                      ) : (
                        <p className="text-center text-muted-foreground py-4">
                          {searchQuery ? "該当するスタンドがありません" : "周辺にスタンドがありません"}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Fuel Type Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  燃料タイプ
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["regular", "high_octane", "diesel", "kerosene"] as FuelType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedFuelType(type)}
                      className={`rounded-lg border p-3 text-sm font-medium transition-colors ${
                        selectedFuelType === type
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-foreground hover:bg-secondary"
                      }`}
                    >
                      {FUEL_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  価格（円/L）
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">¥</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="165"
                    min="100"
                    max="300"
                    className="w-full rounded-lg border border-border bg-background pl-8 pr-12 py-3 text-lg font-bold"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">/L</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!selectedStation || !price || isSubmitting}
                className="w-full rounded-lg bg-primary py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    投稿中...
                  </>
                ) : (
                  "価格を投稿する（+10pt）"
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
