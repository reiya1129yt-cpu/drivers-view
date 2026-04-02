"use client";

import { useEffect, useRef, useCallback } from "react";
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

function LocationMarker({
  onLocationFound,
}: {
  onLocationFound: (latlng: { lat: number; lng: number }) => void;
}) {
  const positionRef = useRef<L.LatLng | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const map = useMap();

  useEffect(() => {
    map.locate({ setView: true, maxZoom: 14 });

    const onFound = (e: L.LocationEvent) => {
      positionRef.current = e.latlng;
      onLocationFound({ lat: e.latlng.lat, lng: e.latlng.lng });
      map.flyTo(e.latlng, 14);
      // Create marker imperatively to avoid re-render issues
      if (markerRef.current) {
        markerRef.current.setLatLng(e.latlng);
      } else {
        markerRef.current = L.marker(e.latlng, { icon: userIcon })
          .addTo(map)
          .bindPopup('<span style="color:#f0f2f5;font-weight:600;">現在地</span>');
      }
    };

    map.on("locationfound", onFound);
    map.on("locationerror", () => {});

    return () => {
      map.off("locationfound", onFound);
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [map, onLocationFound]);

  return null;
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
  // Store the Leaflet map instance so we can destroy it on unmount,
  // preventing the "Map container is being reused" error on HMR / remount.
  const mapRef = useRef<L.Map | null>(null);

  const handleLocationFound = useCallback(
    (latlng: { lat: number; lng: number }) => {
      onLocationFound(latlng);
    },
    [onLocationFound]
  );

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      className={className}
      style={{ minHeight: "400px", height: "100%", width: "100%" }}
      ref={(instance) => {
        if (instance) mapRef.current = instance;
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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
