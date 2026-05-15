"use client";

import { List, MapIcon, ChevronUp, Loader2 } from "lucide-react";
import PlaceCard from "./place-card";
import type { PlaceWithPrices } from "@/lib/types";

interface PlaceListProps {
  places: PlaceWithPrices[];
  userLocation: [number, number] | null;
  onNavigate: (place: PlaceWithPrices) => void;
  onShowDetail: (place: PlaceWithPrices) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isLoading?: boolean;
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
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

export default function PlaceList({
  places,
  userLocation,
  onNavigate,
  onShowDetail,
  isExpanded,
  onToggleExpand,
  isLoading = false,
}: PlaceListProps) {
  const placesWithDistance = places.map((place) => ({
    ...place,
    distance: userLocation
      ? calculateDistance(
          userLocation[0],
          userLocation[1],
          place.latitude,
          place.longitude
        )
      : undefined,
  }));

  const sortedPlaces = [...placesWithDistance].sort((a, b) => {
    if (a.distance !== undefined && b.distance !== undefined) {
      return a.distance - b.distance;
    }
    return 0;
  });

  return (
    <div
      className={`absolute left-0 right-0 z-30 bg-card rounded-t-2xl shadow-lg transition-all duration-300 ${
        isExpanded ? "bottom-14 h-[45vh]" : "bottom-14 h-24"
      }`}
    >
      <div
        className="flex items-center justify-center py-2 cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="w-12 h-1 rounded-full bg-border" />
      </div>

      <div className="px-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <List className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-card-foreground">
            周辺スポット ({places.length})
          </span>
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          )}
        </div>
        <button
          onClick={onToggleExpand}
          className="p-1 rounded-full hover:bg-secondary"
        >
          <ChevronUp
            className={`h-5 w-5 text-muted-foreground transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      <div className="overflow-y-auto px-4 pb-4 h-[calc(100%-3rem)]">
        <div className="flex flex-col gap-3">
          {sortedPlaces.length > 0 ? (
            sortedPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                distance={place.distance}
                onNavigate={onNavigate}
                onShowDetail={onShowDetail}
              />
            ))
          ) : isLoading ? (
            <div className="py-8 text-center">
              <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-2" />
              <p className="text-muted-foreground">
                スポットを検索中...
              </p>
            </div>
          ) : (
            <div className="py-8 text-center">
              <MapIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                この周辺にはスポットがありません
              </p>
              <p className="text-sm text-muted-foreground">
                地図を移動してみてください
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
