"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { PlaceWithPrices, PlaceType } from "@/lib/types";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
const useMap = dynamic(
  () => import("react-leaflet").then((mod) => mod.useMap as unknown),
  { ssr: false }
) as unknown;

interface MapViewProps {
  places: PlaceWithPrices[];
  center: [number, number];
  onBoundsChange?: (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => void;
  onPlaceSelect?: (place: PlaceWithPrices) => void;
  selectedTypes: PlaceType[];
}

function MapEvents({
  onBoundsChange,
}: {
  onBoundsChange?: MapViewProps["onBoundsChange"];
}) {
  const { useMapEvents } = require("react-leaflet");
  
  useMapEvents({
    moveend: (e: { target: { getBounds: () => { getNorth: () => number; getSouth: () => number; getEast: () => number; getWest: () => number } } }) => {
      if (onBoundsChange) {
        const bounds = e.target.getBounds();
        onBoundsChange({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        });
      }
    },
  });

  return null;
}

function RecenterMap({ center }: { center: [number, number] }) {
  const { useMap: useMapHook } = require("react-leaflet");
  const map = useMapHook();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
}

function createIcon(placeType: PlaceType) {
  if (typeof window === "undefined") return null;
  
  const L = require("leaflet");
  const colors: Record<PlaceType, string> = {
    gas_station: "#ef4444",
    pa_sa: "#22c55e",
    ev_charging: "#3b82f6",
  };

  const icons: Record<PlaceType, string> = {
    gas_station: "⛽",
    pa_sa: "🅿️",
    ev_charging: "⚡",
  };

  return L.divIcon({
    html: `<div style="
      width: 32px;
      height: 32px;
      background: ${colors[placeType]};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      border: 2px solid white;
    ">${icons[placeType]}</div>`,
    className: "custom-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

export default function MapView({
  places,
  center,
  onBoundsChange,
  onPlaceSelect,
  selectedTypes,
}: MapViewProps) {
  const [isClient, setIsClient] = useState(false);
  const [icons, setIcons] = useState<Record<PlaceType, unknown> | null>(null);

  useEffect(() => {
    setIsClient(true);
    setIcons({
      gas_station: createIcon("gas_station"),
      pa_sa: createIcon("pa_sa"),
      ev_charging: createIcon("ev_charging"),
    });
  }, []);

  const filteredPlaces = places.filter((place) =>
    selectedTypes.includes(place.place_type)
  );

  if (!isClient) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-secondary">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={14}
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents onBoundsChange={onBoundsChange} />
      <RecenterMap center={center} />
      {filteredPlaces.map((place) => (
        <Marker
          key={place.id}
          position={[place.latitude, place.longitude]}
          icon={icons?.[place.place_type] as L.Icon}
          eventHandlers={{
            click: () => onPlaceSelect?.(place),
          }}
        >
          <Popup>
            <div className="p-2 min-w-[200px]">
              <h3 className="font-semibold text-foreground">{place.name}</h3>
              {place.brand && (
                <p className="text-sm text-muted-foreground">{place.brand}</p>
              )}
              {place.latest_prices.regular && (
                <p className="text-lg font-bold text-primary mt-1">
                  レギュラー: ¥{place.latest_prices.regular}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
