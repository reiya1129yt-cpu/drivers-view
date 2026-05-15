"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2 } from "lucide-react";
import type { PlaceWithPrices, PlaceType } from "@/lib/types";

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
  const map = useMap();

  useMapEvents({
    moveend: () => {
      if (onBoundsChange) {
        const bounds = map.getBounds();
        onBoundsChange({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        });
      }
    },
  });

  // Trigger initial bounds update
  useEffect(() => {
    if (onBoundsChange) {
      const bounds = map.getBounds();
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    }
  }, [map, onBoundsChange]);

  return null;
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
}

const iconColors: Record<PlaceType, string> = {
  gas_station: "#ef4444",
  pa_sa: "#22c55e",
  ev_charging: "#3b82f6",
};

const iconSymbols: Record<PlaceType, string> = {
  gas_station: "⛽",
  pa_sa: "🅿",
  ev_charging: "⚡",
};

function createIcon(placeType: PlaceType): L.DivIcon {
  return L.divIcon({
    html: `<div style="
      width: 36px;
      height: 36px;
      background: ${iconColors[placeType]};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      border: 3px solid white;
    ">${iconSymbols[placeType]}</div>`,
    className: "custom-marker",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}

const gasStationIcon = createIcon("gas_station");
const paSaIcon = createIcon("pa_sa");
const evChargingIcon = createIcon("ev_charging");

const icons: Record<PlaceType, L.DivIcon> = {
  gas_station: gasStationIcon,
  pa_sa: paSaIcon,
  ev_charging: evChargingIcon,
};

export default function MapView({
  places,
  center,
  onBoundsChange,
  onPlaceSelect,
  selectedTypes,
}: MapViewProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
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
          icon={icons[place.place_type]}
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
              {place.latest_prices?.regular && (
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
