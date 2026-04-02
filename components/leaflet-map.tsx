"use client";

import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { GasStation } from "@/lib/types";
import GasStationMarker from "./gas-station-marker";

const userIcon = L.divIcon({
  className: "user-location-marker",
  html: `
    <div style="
      background:#3b82f6;
      width:18px;height:18px;
      border-radius:50%;
      border:3px solid white;
      box-shadow:0 0 0 3px rgba(59,130,246,0.35),0 2px 8px rgba(0,0,0,0.4);
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function MapResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const handleResize = () => map.invalidateSize();
    window.addEventListener("resize", handleResize);
    setTimeout(() => map.invalidateSize(), 150);
    return () => window.removeEventListener("resize", handleResize);
  }, [map]);
  return null;
}

function LocationMarker({ onLocationFound }: { onLocationFound: (latlng: { lat: number; lng: number }) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const map = useMap();

  useEffect(() => {
    map.locate({ setView: true, maxZoom: 14 });
    map.on("locationfound", (e) => {
      setPosition(e.latlng);
      onLocationFound({ lat: e.latlng.lat, lng: e.latlng.lng });
      map.flyTo(e.latlng, 14);
    });
    map.on("locationerror", () => {});
  }, [map, onLocationFound]);

  return position ? (
    <Marker position={position} icon={userIcon}>
      <Popup>
        <span style={{ color: "#f0f2f5", fontWeight: 600 }}>現在地</span>
      </Popup>
    </Marker>
  ) : null;
}

function FlyToLocation({ location }: { location: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (location) map.flyTo(location, 16);
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
  const handleLocationFound = useCallback((latlng: { lat: number; lng: number }) => {
    onLocationFound(latlng);
  }, [onLocationFound]);

  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ background: "#1a1d27", minHeight: "400px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", color: "#6b7280" }}>
          <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#2a2f42" strokeWidth="4" />
            <path d="M4 12a8 8 0 018-8" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: "14px" }}>マップを読み込み中...</span>
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
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapResizeHandler />
      {showUserLocation && <LocationMarker onLocationFound={handleLocationFound} />}
      {stations.map((station) => (
        <GasStationMarker key={station.id} station={station} />
      ))}
      <FlyToLocation location={flyToLocation} />
    </MapContainer>
  );
}
