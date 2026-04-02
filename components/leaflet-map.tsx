"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { GasStation } from "@/lib/types";
import { FUEL_TYPE_LABELS, FUEL_TYPE_COLORS, FUEL_TYPE_BG } from "@/lib/types";
import { MOCK_STATIONS } from "@/lib/mock-data";

// ── SVG marker icon builders ──────────────────────────────────────────────────
// Nozzle shape: a clean fuel pump nozzle icon drawn in a 24×24 grid

const NOZZLE_PATH = `
  M5 20 L5 10 Q5 7 8 7 L10 7 L10 5 Q10 3 12 3 L16 3 Q18 3 18 5 L18 11
  Q18 13 16 13 L12 13 Q10 13 10 11 L10 9 L8 9 Q8 9 8 10 L8 20 Z
  M14 6 L14 10 M19 6 Q21 6 21 8 L21 12 Q21 14 19 14
`;

const PLUG_PATH = `
  M9 3 L9 7 M15 3 L15 7
  M7 7 L17 7 L17 13 Q17 17 12 17 Q7 17 7 13 L7 7 Z
  M12 17 L12 21
  M10 21 L14 21
`;

function buildIconSVG(iconPath: string, color: string, price: string, label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 86 62" width="86" height="62">
  <defs>
    <filter id="d" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.6)"/>
    </filter>
  </defs>
  <g filter="url(#d)">
    <rect x="3" y="2" width="80" height="42" rx="11" fill="#12151f" stroke="${color}" stroke-width="2.2"/>
    <text x="55" y="22" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-weight="900" font-size="17" fill="${color}">¥${price}</text>
    <text x="55" y="35" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-weight="500" font-size="9.5" fill="#9ca3af" letter-spacing="0.3">${label}</text>
    <g transform="translate(7,9) scale(1.15)">
      <path d="${iconPath}" stroke="${color}" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <polygon points="35,44 43,58 51,44" fill="#12151f" stroke="${color}" stroke-width="2.2" stroke-linejoin="round"/>
    <polygon points="36.5,44 43,56 49.5,44" fill="#12151f"/>
  </g>
</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function makeMarkerIcon(L: any, station: GasStation) {
  const color = FUEL_TYPE_COLORS[station.fuel_type] ?? "#ef4444";
  const label = FUEL_TYPE_LABELS[station.fuel_type] ?? "";
  const price = Number(station.price).toFixed(0);
  const isEV = station.fuel_type === "ev_charging";
  const iconPath = isEV ? PLUG_PATH : NOZZLE_PATH;
  const url = buildIconSVG(iconPath, color, price, label);
  return L.icon({ iconUrl: url, iconSize: [86, 62], iconAnchor: [43, 58], popupAnchor: [0, -62] });
}

// ── Component ─────────────────────────────────────────────────────────────────

export interface LeafletMapProps {
  center?: [number, number];
  zoom?: number;
  stations: GasStation[];
  onLocationFound: (latlng: { lat: number; lng: number }) => void;
  fuelFilter: string;
  flyTo?: { lat: number; lng: number; zoom?: number } | null;
}

export default function LeafletMap({
  center = [35.6762, 139.6503],
  zoom = 12,
  stations,
  onLocationFound,
  fuelFilter,
  flyTo,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<any>(null);
  const markersRef   = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const onLocationFoundRef = useRef(onLocationFound);
  onLocationFoundRef.current = onLocationFound;

  // ── Init map once ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if ((containerRef.current as any)._leaflet_id) return;

    let cancelled = false;

    import("leaflet").then((mod) => {
      if (cancelled || !containerRef.current) return;
      if (mapRef.current || (containerRef.current as any)._leaflet_id) return;

      const L = mod.default;
      const map = L.map(containerRef.current, { center, zoom, zoomControl: true });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      // Geolocation
      map.locate({ setView: false, maxZoom: 14 });
      map.on("locationfound", (e: any) => {
        if (!mapRef.current) return;
        onLocationFoundRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
        map.flyTo(e.latlng, 14);

        const userIcon = L.divIcon({
          className: "",
          html: `<div style="background:#3b82f6;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(59,130,246,0.3),0 2px 8px rgba(0,0,0,0.4);"></div>`,
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

  // ── Update markers when stations change ──────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    let cancelled = false;

    import("leaflet").then((mod) => {
      if (cancelled || !mapRef.current) return;
      const L   = mod.default;
      const map = mapRef.current;

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      stations.forEach((station) => {
        const color = FUEL_TYPE_COLORS[station.fuel_type] ?? "#ef4444";
        const label = FUEL_TYPE_LABELS[station.fuel_type] ?? station.fuel_type;
        const bg    = FUEL_TYPE_BG[station.fuel_type]     ?? "rgba(239,68,68,0.15)";
        const unit  = station.fuel_type === "ev_charging" ? "/kWh" : "/L";

        const icon = makeMarkerIcon(L, station);

        const reportedDate = new Date(station.reported_at).toLocaleDateString("ja-JP", {
          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
        });

        const popup = L.popup({ className: "dark-popup", maxWidth: 240 }).setContent(`
          <div style="min-width:190px;padding:4px 2px;">
            <div style="font-weight:700;font-size:15px;color:#f0f2f5;margin-bottom:8px;line-height:1.35;">${station.station_name}</div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap;">
              <span style="background:${bg};color:${color};padding:2px 9px;border-radius:20px;font-size:11px;font-weight:600;border:1px solid ${color}55;">${label}</span>
              <span style="font-size:22px;font-weight:900;color:${color};">¥${Number(station.price).toFixed(0)}</span>
              <span style="font-size:12px;color:#6b7280;">${unit}</span>
            </div>
            ${station.comment ? `<div style="font-size:12px;color:#9ca3af;background:#1a1d2a;padding:6px 8px;border-radius:8px;margin-bottom:6px;">"${station.comment}"</div>` : ""}
            <div style="font-size:11px;color:#4b5563;">${reportedDate} 更新</div>
          </div>
        `);

        const marker = L.marker([station.latitude, station.longitude], { icon })
          .addTo(map)
          .bindPopup(popup);
        markersRef.current.push(marker);
      });
    });

    return () => { cancelled = true; };
  }, [stations]);

  // ── External flyTo (from search) ─────────────────────────────────────────────
  useEffect(() => {
    if (!flyTo || !mapRef.current) return;
    mapRef.current.flyTo([flyTo.lat, flyTo.lng], flyTo.zoom ?? 15, { duration: 1.2 });
  }, [flyTo]);

  return (
    <>
      <style>{`
        .dark-popup .leaflet-popup-content-wrapper {
          background: #1e2235;
          border: 1px solid #2a2f42;
          border-radius: 14px;
          box-shadow: 0 10px 32px rgba(0,0,0,0.6);
          padding: 6px;
        }
        .dark-popup .leaflet-popup-tip-container .leaflet-popup-tip {
          background: #1e2235;
        }
        .dark-popup .leaflet-popup-close-button {
          color: #6b7280 !important;
          font-size: 18px !important;
          top: 8px !important;
          right: 10px !important;
        }
        .dark-popup .leaflet-popup-close-button:hover { color: #f0f2f5 !important; }
        .leaflet-container { font-family: system-ui, sans-serif; }
      `}</style>
      <div ref={containerRef} style={{ width: "100%", height: "100%", background: "#1a1d27" }} />
    </>
  );
}
