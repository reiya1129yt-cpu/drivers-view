"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { GasStation, FuelType } from "@/lib/types";
import { FUEL_TYPE_LABELS, FUEL_TYPE_COLORS, FUEL_TYPE_BG } from "@/lib/types";

// ── Custom SVG marker icons ───────────────────────────────────────────────────

function nozzleIconSVG(color: string, price: string, label: string): string {
  // Fuel nozzle handle shape + price badge + callout triangle
  const nozzle = `
    <rect x="6" y="14" width="3.5" height="9" rx="1.5" fill="white"/>
    <rect x="7.5" y="17" width="7" height="2.5" rx="1" fill="white"/>
    <rect x="10" y="9" width="12" height="5" rx="2" fill="white"/>
    <path d="M8 14 Q7 10 11.5 10" stroke="white" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <rect x="22" y="7" width="3.5" height="10" rx="1.5" fill="white"/>
    <rect x="20.5" y="16" width="6" height="2.5" rx="1" fill="white"/>
  `;
  const encoded = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 58" width="80" height="58">
  <defs>
    <filter id="sh" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="rgba(0,0,0,0.55)"/>
    </filter>
  </defs>
  <g filter="url(#sh)">
    <!-- badge pill -->
    <rect x="2" y="2" width="76" height="38" rx="10" fill="#1a1d27" stroke="${color}" stroke-width="2.5"/>
    <!-- nozzle icon left side -->
    ${nozzle}
    <!-- price text -->
    <text x="42" y="23" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="800" font-size="16" fill="${color}">¥${price}</text>
    <!-- label text -->
    <text x="42" y="34" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="500" font-size="9" fill="#9ca3af">${label}</text>
    <!-- callout arrow -->
    <polygon points="32,40 40,52 48,40" fill="#1a1d27" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"/>
    <polygon points="33,40 40,50 47,40" fill="#1a1d27"/>
  </g>
</svg>`);
  return `data:image/svg+xml;charset=UTF-8,${encoded}`;
}

function evIconSVG(color: string, price: string): string {
  const encoded = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 58" width="80" height="58">
  <defs>
    <filter id="sh" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="rgba(0,0,0,0.55)"/>
    </filter>
  </defs>
  <g filter="url(#sh)">
    <rect x="2" y="2" width="76" height="38" rx="10" fill="#1a1d27" stroke="${color}" stroke-width="2.5"/>
    <!-- lightning bolt -->
    <polygon points="18,6 10,22 16,22 12,34 22,16 16,16" fill="${color}"/>
    <!-- price text -->
    <text x="44" y="23" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="800" font-size="16" fill="${color}">¥${price}</text>
    <!-- label text -->
    <text x="44" y="34" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="500" font-size="9" fill="#9ca3af">EV充電</text>
    <polygon points="32,40 40,52 48,40" fill="#1a1d27" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"/>
    <polygon points="33,40 40,50 47,40" fill="#1a1d27"/>
  </g>
</svg>`);
  return `data:image/svg+xml;charset=UTF-8,${encoded}`;
}

function makeMarkerIcon(L: any, station: GasStation) {
  const color = FUEL_TYPE_COLORS[station.fuel_type] ?? "#22c55e";
  const label = FUEL_TYPE_LABELS[station.fuel_type] ?? "";
  const price = Number(station.price).toFixed(0);
  const url = station.fuel_type === "ev_charging"
    ? evIconSVG(color, price)
    : nozzleIconSVG(color, price, label);
  return L.icon({ iconUrl: url, iconSize: [80, 58], iconAnchor: [40, 54], popupAnchor: [0, -58] });
}

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
        const color   = FUEL_TYPE_COLORS[station.fuel_type] ?? "#22c55e";
        const label   = FUEL_TYPE_LABELS[station.fuel_type] ?? station.fuel_type;
        const bg      = FUEL_TYPE_BG[station.fuel_type]     ?? "rgba(34,197,94,0.15)";
        const unit    = station.fuel_type === "ev_charging" ? "/kWh" : "/L";

        const icon = makeMarkerIcon(L, station);

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
              <span style="font-size:12px;color:#6b7280;">${unit}</span>
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
    <>
      <style>{`
        .dark-popup .leaflet-popup-content-wrapper {
          background: #1e2235;
          border: 1px solid #2a2f42;
          border-radius: 12px;
          box-shadow: 0 8px 28px rgba(0,0,0,0.55);
          padding: 4px;
        }
        .dark-popup .leaflet-popup-tip-container .leaflet-popup-tip {
          background: #1e2235;
        }
        .dark-popup .leaflet-popup-close-button {
          color: #6b7280 !important;
          font-size: 18px !important;
          top: 6px !important;
          right: 8px !important;
        }
        .dark-popup .leaflet-popup-close-button:hover { color: #f0f2f5 !important; }
      `}</style>
      <div ref={containerRef} style={{ width: "100%", height: "100%", background: "#1a1d27" }} />
    </>
  );
}
