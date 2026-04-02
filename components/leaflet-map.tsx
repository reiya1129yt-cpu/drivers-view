
"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { GasStation } from "@/lib/types";
import { FUEL_TYPE_LABELS, FUEL_TYPE_COLORS, FUEL_TYPE_BG } from "@/lib/types";

// ── SVG icon builders ─────────────────────────────────────────────────────────

const NOZZLE_PATH =
  "M7 19 L7 11 Q7 8 10 8 L12 8 L12 6 Q12 4 14 4 L17 4 Q19 4 19 6 L19 11 Q19 13 17 13 L14 13 Q12 13 12 11 L12 9 L10 9 Q10 10 10 11 L10 19 Z M20 6 Q22 6 22 9 L22 12 Q22 14 20 14";

const PLUG_PATH =
  "M9 4 L9 8 M15 4 L15 8 M7 8 L17 8 L17 14 Q17 18 12 18 Q7 18 7 14 L7 8 Z M12 18 L12 22 M10 22 L14 22";

function buildIconSVG(
  iconPath: string,
  color: string,
  price: string,
  label: string
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 64" width="88" height="64">
  <defs>
    <filter id="ds" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.65)"/>
    </filter>
  </defs>
  <g filter="url(#ds)">
    <rect x="3" y="2" width="82" height="44" rx="12" fill="#12151f" stroke="${color}" stroke-width="2.4"/>
    <g transform="translate(9,10) scale(1.1)">
      <path d="${iconPath}" stroke="${color}" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <text x="57" y="24" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-weight="900" font-size="18" fill="${color}">&#165;${price}</text>
    <text x="57" y="37" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-weight="500" font-size="10" fill="#9ca3af" letter-spacing="0.5">${label}</text>
    <polygon points="36,46 44,60 52,46" fill="#12151f" stroke="${color}" stroke-width="2.4" stroke-linejoin="round"/>
    <polygon points="37.5,46 44,58 50.5,46" fill="#12151f"/>
  </g>
</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function makeMarkerIcon(L: any, station: GasStation) {
  const color = FUEL_TYPE_COLORS[station.fuel_type] ?? "#ef4444";
  const label = FUEL_TYPE_LABELS[station.fuel_type] ?? "";
  const price = Number(station.price).toFixed(0);
  const url = buildIconSVG(
    station.fuel_type === "ev_charging" ? PLUG_PATH : NOZZLE_PATH,
    color,
    price,
    label
  );
  return L.icon({ iconUrl: url, iconSize: [88, 64], iconAnchor: [44, 60], popupAnchor: [0, -64] });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderMarkers(L: any, map: any, stations: GasStation[], markersRef: React.MutableRefObject<any[]>) {
  // Clear existing
  markersRef.current.forEach((m) => { try { m.remove(); } catch {} });
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
          <span style="font-size:22px;font-weight:900;color:${color};">&#165;${Number(station.price).toFixed(0)}</span>
          <span style="font-size:12px;color:#6b7280;">${unit}</span>
        </div>
        ${station.comment ? `<div style="font-size:12px;color:#9ca3af;background:#1a1d2a;padding:6px 8px;border-radius:8px;margin-bottom:6px;">&ldquo;${station.comment}&rdquo;</div>` : ""}
        <div style="font-size:11px;color:#4b5563;">${reportedDate} 更新</div>
      </div>
    `);

    const marker = L.marker([station.latitude, station.longitude], { icon })
      .addTo(map)
      .bindPopup(popup);
    markersRef.current.push(marker);
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export interface LeafletMapProps {
  center?: [number, number];
  zoom?: number;
  stations: GasStation[];
  onLocationFound: (latlng: { lat: number; lng: number }) => void;
  flyTo?: { lat: number; lng: number; zoom?: number } | null;
}

export default function LeafletMap({
  center = [35.6762, 139.6503],
  zoom = 12,
  stations,
  onLocationFound,
  flyTo,
}: LeafletMapProps) {
  const containerRef      = useRef<HTMLDivElement>(null);
  const mapRef            = useRef<any>(null);
  const LRef              = useRef<any>(null);
  const markersRef        = useRef<any[]>([]);
  const userMarkerRef     = useRef<any>(null);
  const onLocationFoundRef = useRef(onLocationFound);
  onLocationFoundRef.current = onLocationFound;

  // mapReady triggers the markers effect after async init completes
  const [mapReady, setMapReady] = useState(false);

  // ── Init map once (async, cancellation-safe) ─────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if ((containerRef.current as any)._leaflet_id) return;

    let cancelled = false;

    import("leaflet").then((mod) => {
      if (cancelled || !containerRef.current) return;
      if (mapRef.current || (containerRef.current as any)._leaflet_id) return;

      const L = mod.default;
      LRef.current = L;

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
          iconSize: [16, 16], iconAnchor: [8, 8],
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
      setTimeout(() => map.invalidateSize(), 300);
      (map as any)._resizeCleanup = () => window.removeEventListener("resize", onResize);

      // Signal that the map is ready — triggers the markers effect
      setMapReady(true);
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        try {
          if ((mapRef.current as any)._resizeCleanup) (mapRef.current as any)._resizeCleanup();
          mapRef.current.stop();
          mapRef.current.remove();
        } catch {}
        mapRef.current = null;
        LRef.current   = null;
        markersRef.current = [];
        userMarkerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Draw / redraw markers whenever stations OR mapReady changes ───────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current || !LRef.current) return;
    renderMarkers(LRef.current, mapRef.current, stations, markersRef);
  }, [mapReady, stations]);

  // ── External flyTo ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!flyTo || !mapRef.current) return;
    try {
      mapRef.current.stop(); // cancel any in-progress animation first
      mapRef.current.flyTo([flyTo.lat, flyTo.lng], flyTo.zoom ?? 15, { duration: 1.0 });
    } catch {
      // map may have been destroyed between render and effect
    }
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
        .dark-popup .leaflet-popup-tip { background: #1e2235; }
        .dark-popup .leaflet-popup-close-button {
          color: #6b7280 !important;
          font-size: 18px !important;
          top: 8px !important;
          right: 10px !important;
        }
        .dark-popup .leaflet-popup-close-button:hover { color: #f0f2f5 !important; }
        .leaflet-container { font-family: system-ui, sans-serif; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      <div ref={containerRef} style={{ width: "100%", height: "100%", background: "#1a1d27" }} />
    </>
  );
}
