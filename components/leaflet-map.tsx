"use client";

import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { GasStation, GasStationInput } from "@/lib/types";
import GasStationMarker from "./gas-station-marker";

// User location marker icon (blue)
const userIcon = L.divIcon({
  className: "user-location-marker",
  html: `
    <div style="
      background: #3b82f6;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 0 2px #3b82f6, 0 2px 8px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Component to handle map resizing on mobile
function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener("resize", handleResize);
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [map]);

  return null;
}

// Component to get user's current location
function LocationMarker({
  onLocationFound,
}: {
  onLocationFound: (latlng: { lat: number; lng: number }) => void;
}) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const map = useMap();

  useEffect(() => {
    map.locate({ setView: true, maxZoom: 14 });

    map.on("locationfound", (e) => {
      setPosition(e.latlng);
      onLocationFound({ lat: e.latlng.lat, lng: e.latlng.lng });
      map.flyTo(e.latlng, 14);
    });

    map.on("locationerror", () => {
      console.log("Location access denied or unavailable");
    });
  }, [map, onLocationFound]);

  return position ? (
    <Marker position={position} icon={userIcon}>
      <Popup>
        <span className="font-medium">You are here</span>
      </Popup>
    </Marker>
  ) : null;
}

// Component to fly to a specific location
function FlyToLocation({ location }: { location: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.flyTo(location, 16);
    }
  }, [map, location]);

  return null;
}

interface LeafletMapProps {
  center?: [number, number];
  zoom?: number;
  showUserLocation?: boolean;
  stations: GasStation[];
  onLocationFound: (latlng: { lat: number; lng: number }) => void;
  flyToLocation?: [number, number] | null;
  className?: string;
}

export default function LeafletMap({
  center = [35.6762, 139.6503],
  zoom = 13,
  showUserLocation = true,
  stations = [],
  onLocationFound,
  flyToLocation = null,
  className = "",
}: LeafletMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  const handleLocationFound = useCallback(
    (latlng: { lat: number; lng: number }) => {
      onLocationFound(latlng);
    },
    [onLocationFound]
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div
        className={`flex items-center justify-center bg-muted ${className}`}
        style={{ minHeight: "400px" }}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <svg
            className="h-8 w-8 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading map...</span>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      className={className}
      style={{ minHeight: "400px", height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapResizeHandler />
      {showUserLocation && (
        <LocationMarker onLocationFound={handleLocationFound} />
      )}
      {stations.map((station) => (
        <GasStationMarker key={station.id} station={station} />
      ))}
      <FlyToLocation location={flyToLocation} />
    </MapContainer>
  );
}
