"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { GasStation } from "@/lib/types";
import { FUEL_TYPE_LABELS, FUEL_TYPE_COLORS, FUEL_TYPE_BG } from "@/lib/types";

interface LeafletMapProps {
  center?: [number, number];
  zoom?: number;
  stations: GasStation[];
  onLocationFound: (latlng: { lat: number; lng: number }) => void;
  fuelFilter: string;
}

export default function LeafletMap({
  center = [35.6762, 139.6503],
  zoom = 12,
  stations,
  onLocationFound,
  fuelFilter,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const onLocationFoundRef = useRef(onLocationFound);
  onLocationFoundRef.current = onLocationFound;

  // Init map once — imperative Leaflet, no react-leaflet
  useEffect(() => {
    // Guard: already initialised or container missing
    if (!containerRef.current || mapRef.current) return;
    // Guard: Leaflet already owns this DOM node (strict-mode double-invoke)
    if ((containerRef.current as any)._leaflet_id) return;

    // Cancellation flag: if cleanup runs before the async import resolves, bail out
    let cancelled = false;

    import("leaflet").then((mod) => {
      if (cancelled || !containerRef.current) return;
      // Double-check after async gap
      if (mapRef.current || (containerRef.current as any)._leaflet_id) return;

      const L = mod.default;

      const map = L.map(containerRef.current, { center, zoom, zoomControl: true });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      // Locate user
      map.locate({ setView: false, maxZoom: 14 });
      map.on("locationfound", (e: any) => {
        if (!mapRef.current) return;
        onLocationFoundRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
        map.flyTo(e.latlng, 14);

        const userIcon = L.divIcon({
          className: "",
          html: `<div style="background:#3b82f6;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 3px rgba(59,130,246,0.35),0 2px 8px rgba(0,0,0,0.4);"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng(e.latlng);
        } else {
          userMarkerRef.current = L.marker(e.latlng, { icon: userIcon })
            .addTo(map)
            .bindPopup('<span style="color:#f0f2f5;font-weight:600;">現在地</span>');
        }
      });

      // Resize handler
      const onResize = () => map.invalidateSize();
      window.addEventListener("resize", onResize);
      setTimeout(() => map.invalidateSize(), 200);
      (map as any)._resizeCleanup = () => window.removeEventListener("resize", onResize);
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        if ((mapRef.current as any)._resizeCleanup) (mapRef.current as any)._resizeCleanup();
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = [];
        userMarkerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update gas station markers when stations or filter changes
  useEffect(() => {
    if (!mapRef.current) return;
    let cancelled = false;

    import("leaflet").then((mod) => {
      if (cancelled || !mapRef.current) return;
      const L = mod.default;
      const map = mapRef.current;

      // Remove old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // Add new markers
      stations.forEach((station) => {
        const color = FUEL_TYPE_COLORS[station.fuel_type];
        const label = FUEL_TYPE_LABELS[station.fuel_type];
        const bg = FUEL_TYPE_BG[station.fuel_type];

        const icon = L.divIcon({
          className: "",
          html: `
            <div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.5));">
              <div style="position:relative;background:#1a1d27;border:2.5px solid ${color};border-radius:10px;padding:5px 10px;text-align:center;min-width:60px;">
                <svg viewBox="0 0 20 20" width="13" height="13" style="position:absolute;top:-7px;right:-7px;background:#1a1d27;border-radius:50%;padding:1px;" fill="${color}">
                  <path d="M6 2a1 1 0 00-1 1v1H3a1 1 0 000 2h.535l.709 7.095A2 2 0 006.237 15h7.526a2 2 0 001.993-1.905L16.465 6H17a1 1 0 000-2h-2V3a1 1 0 00-1-1H6zm1 2h6v1H7V4zm-1.465 2h8.93l-.664 6.643A.5.5 0 0113.763 13H6.237a.5.5 0 01-.498-.357L5.535 6zM9 8v3a1 1 0 002 0V8a1 1 0 00-2 0z"/>
                </svg>
                <div style="font-size:15px;font-weight:800;color:${color};line-height:1.1;">¥${Number(station.price).toFixed(0)}</div>
                <div style="font-size:9px;color:#9ca3af;margin-top:1px;letter-spacing:0.03em;">${label}</div>
              </div>
              <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid ${color};margin-top:-1px;"></div>
            </div>
          `,
          iconSize: [72, 56],
          iconAnchor: [36, 56],
          popupAnchor: [0, -60],
        });

        const reportedDate = new Date(station.reported_at).toLocaleDateString("ja-JP", {
          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
        });

        const popup = L.popup({
          className: "dark-popup",
          maxWidth: 240,
        }).setContent(`
          <div style="min-width:180px;">
            <div style="font-weight:700;font-size:15px;color:#f0f2f5;margin-bottom:8px;line-height:1.3;">${station.station_name}</div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap;">
              <span style="background:${bg};color:${color};padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;border:1px solid ${color}44;">${label}</span>
              <span style="font-size:22px;font-weight:800;color:${color};">¥${Number(station.price).toFixed(0)}</span>
              <span style="font-size:12px;color:#6b7280;">/L</span>
            </div>
            ${station.comment ? `<div style="font-size:12px;color:#9ca3af;background:#22263a;padding:6px 8px;border-radius:6px;margin-bottom:6px;">${station.comment}</div>` : ""}
            <div style="font-size:11px;color:#6b7280;">${reportedDate} 更新</div>
          </div>
        `);

        const marker = L.marker([station.latitude, station.longitude], { icon }).addTo(map).bindPopup(popup);
        markersRef.current.push(marker);
      });
    });

    return () => { cancelled = true; };
  }, [stations]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", background: "#1a1d27" }}
    />
  );
}
