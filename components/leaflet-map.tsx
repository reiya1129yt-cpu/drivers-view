"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { GasStation, PaSaSpot } from "@/lib/types";
import { FUEL_TYPE_LABELS, FUEL_TYPE_COLORS, FUEL_TYPE_BG, CONGESTION_LABELS, CONGESTION_COLORS } from "@/lib/types";

// ── SVG icon builders ─────────────────────────────────────────────────────────

// Fuel nozzle path (red for gas, orange/blue for other fuel types)
const NOZZLE_PATH = "M6 20 L6 12 Q6 9 9 9 L11 9 L11 7 Q11 5 13 5 L16 5 Q18 5 18 7 L18 12 Q18 14 16 14 L13 14 Q11 14 11 12 L11 10 L9 10 Q9 12 9 12 L9 20 Z M19 7 Q21 7 21 10 L21 13 Q21 15 19 15";

// EV plug path (purple)
const PLUG_PATH = "M8 3 L8 8 M16 3 L16 8 M6 8 L18 8 L18 15 Q18 20 12 20 Q6 20 6 15 L6 8 Z M12 20 L12 23 M9.5 23 L14.5 23 M11 12 L11 16 L13 14 L13 18";

// PA/SA highway sign icon
const PASA_PATH = "M3 6 Q3 3 6 3 L18 3 Q21 3 21 6 L21 18 Q21 21 18 21 L6 21 Q3 21 3 18 Z M7 8 L7 16 M7 8 L12 14 L17 8 M17 8 L17 16";

function buildBadgeSVG(
  iconPath: string,
  color: string,
  price: string,
  label: string,
  glowRing: boolean,
): string {
  const ring = glowRing
    ? `<rect x="1" y="1" width="86" height="46" rx="13" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.45"/>`
    : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 66" width="88" height="66">
  <defs>
    <filter id="ds" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="3" stdDeviation="3.5" flood-color="rgba(0,0,0,0.7)"/>
    </filter>
    ${glowRing ? `<filter id="glow"><feGaussianBlur stdDeviation="2.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` : ""}
  </defs>
  <g filter="url(#ds)">
    ${ring}
    <rect x="3" y="3" width="82" height="44" rx="11" fill="#0f1117" stroke="${color}" stroke-width="2.2"/>
    <g transform="translate(10,12)">
      <path d="${iconPath}" stroke="${color}" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <text x="57" y="26" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-weight="900" font-size="17" fill="${color}">&#165;${price}</text>
    <text x="57" y="38" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-weight="600" font-size="9.5" fill="#9ca3af" letter-spacing="0.4">${label}</text>
    <polygon points="36,47 44,62 52,47" fill="#0f1117" stroke="${color}" stroke-width="2.2" stroke-linejoin="round"/>
    <polygon points="37.5,47 44,59.5 50.5,47" fill="#0f1117"/>
  </g>
</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildPaSaSVG(spot: PaSaSpot): string {
  const congColor = CONGESTION_COLORS[spot.congestion];
  const isOpen    = spot.status === "open";
  const bgColor   = isOpen ? "#0f1117" : "#1a1a1a";
  const borderColor = isOpen ? "#f59e0b" : "#4b5563";
  const label     = spot.type;
  const name      = spot.name.length > 6 ? spot.name.slice(0, 6) + "…" : spot.name;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 64" width="80" height="64">
  <defs>
    <filter id="ds2" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.65)"/>
    </filter>
  </defs>
  <g filter="url(#ds2)">
    <rect x="3" y="3" width="74" height="42" rx="9" fill="${bgColor}" stroke="${borderColor}" stroke-width="2"/>
    <!-- PA/SA type badge -->
    <rect x="8" y="8" width="22" height="16" rx="4" fill="${borderColor}33" stroke="${borderColor}" stroke-width="1.2"/>
    <text x="19" y="20" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-weight="900" font-size="11" fill="${borderColor}">${label}</text>
    <!-- Congestion dot -->
    <circle cx="66" cy="12" r="5" fill="${congColor}"/>
    <!-- Name -->
    <text x="40" y="34" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-weight="700" font-size="11" fill="${isOpen ? "#f0f2f5" : "#6b7280"}">${name}</text>
    <polygon points="30,45 40,59 50,45" fill="${bgColor}" stroke="${borderColor}" stroke-width="2" stroke-linejoin="round"/>
    <polygon points="31.5,45 40,57.5 48.5,45" fill="${bgColor}"/>
  </g>
</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function makeStationIcon(L: any, station: GasStation) {
  const color     = FUEL_TYPE_COLORS[station.fuel_type] ?? "#ef4444";
  const label     = FUEL_TYPE_LABELS[station.fuel_type] ?? "";
  const price     = Number(station.price).toFixed(0);
  const iconPath  = station.fuel_type === "ev_charging" ? PLUG_PATH : NOZZLE_PATH;
  const glowRing  = !!station.has_user_price;
  const url       = buildBadgeSVG(iconPath, color, price, label, glowRing);
  return L.icon({ iconUrl: url, iconSize: [88, 66], iconAnchor: [44, 62], popupAnchor: [0, -66] });
}

function makePaSaIcon(L: any, spot: PaSaSpot) {
  const url = buildPaSaSVG(spot);
  return L.icon({ iconUrl: url, iconSize: [80, 64], iconAnchor: [40, 60], popupAnchor: [0, -64] });
}

// ── Render helpers ────────────────────────────────────────────────────────────

function renderStationMarkers(
  L: any, map: any,
  stations: GasStation[],
  markersRef: React.MutableRefObject<any[]>
) {
  markersRef.current.forEach((m) => { try { map.removeLayer(m); } catch {} });
  markersRef.current = [];

  stations.forEach((station) => {
    const color = FUEL_TYPE_COLORS[station.fuel_type] ?? "#ef4444";
    const label = FUEL_TYPE_LABELS[station.fuel_type] ?? station.fuel_type;
    const bg    = FUEL_TYPE_BG[station.fuel_type]     ?? "rgba(239,68,68,0.15)";
    const unit  = station.fuel_type === "ev_charging" ? "/kWh" : "/L";

    const icon  = makeStationIcon(L, station);

    const dt = new Date(station.reported_at).toLocaleDateString("ja-JP", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });

    const userBadge = station.has_user_price
      ? `<span style="display:inline-block;background:#22c55e22;color:#22c55e;border:1px solid #22c55e55;border-radius:6px;font-size:10px;font-weight:700;padding:1px 7px;margin-bottom:6px;">ユーザー投稿価格</span><br/>`
      : "";

    const popup = L.popup({ className: "dark-popup", maxWidth: 240 }).setContent(`
      <div style="min-width:190px;padding:4px 2px;">
        <div style="font-weight:700;font-size:15px;color:#f0f2f5;margin-bottom:6px;line-height:1.35;">${station.station_name}</div>
        ${userBadge}
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap;">
          <span style="background:${bg};color:${color};padding:2px 9px;border-radius:20px;font-size:11px;font-weight:600;border:1px solid ${color}55;">${label}</span>
          <span style="font-size:22px;font-weight:900;color:${color};">&#165;${Number(station.price).toFixed(0)}</span>
          <span style="font-size:12px;color:#6b7280;">${unit}</span>
        </div>
        ${station.comment ? `<div style="font-size:12px;color:#9ca3af;background:#1a1d2a;padding:6px 8px;border-radius:8px;margin-bottom:6px;">&ldquo;${station.comment}&rdquo;</div>` : ""}
        <div style="font-size:11px;color:#4b5563;">${dt} 更新</div>
      </div>
    `);

    const marker = L.marker([station.latitude, station.longitude], { icon }).addTo(map).bindPopup(popup);
    markersRef.current.push(marker);
  });
}

function renderPaSaMarkers(
  L: any, map: any,
  spots: PaSaSpot[],
  markersRef: React.MutableRefObject<any[]>
) {
  markersRef.current.forEach((m) => { try { map.removeLayer(m); } catch {} });
  markersRef.current = [];

  spots.forEach((spot) => {
    const icon = makePaSaIcon(L, spot);
    const congColor = CONGESTION_COLORS[spot.congestion];
    const statusLabel = spot.status === "open" ? "営業中" : "閉鎖中";
    const congLabel = CONGESTION_LABELS[spot.congestion];

    const popup = L.popup({ className: "dark-popup", maxWidth: 240 }).setContent(`
      <div style="min-width:190px;padding:4px 2px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <span style="background:#f59e0b22;color:#f59e0b;border:1px solid #f59e0b55;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;">${spot.type}</span>
          <span style="font-weight:700;font-size:15px;color:#f0f2f5;">${spot.name}</span>
        </div>
        <div style="font-size:12px;color:#9ca3af;margin-bottom:6px;">${spot.highway}</div>
        <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;">
          <span style="background:${spot.status === "open" ? "#22c55e22" : "#4b556322"};color:${spot.status === "open" ? "#22c55e" : "#6b7280"};border:1px solid ${spot.status === "open" ? "#22c55e55" : "#4b556355"};padding:2px 9px;border-radius:20px;font-size:11px;font-weight:600;">${statusLabel}</span>
          <span style="background:${congColor}22;color:${congColor};border:1px solid ${congColor}55;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:600;">${congLabel}</span>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;">
          ${spot.facilities.map(f => `<span style="background:#22263a;color:#9ca3af;padding:2px 8px;border-radius:6px;font-size:11px;">${f}</span>`).join("")}
        </div>
      </div>
    `);

    const marker = L.marker([spot.latitude, spot.longitude], { icon }).addTo(map).bindPopup(popup);
    markersRef.current.push(marker);
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export interface LeafletMapProps {
  center?: [number, number];
  zoom?: number;
  stations: GasStation[];
  pasaSpots?: PaSaSpot[];
  onLocationFound: (latlng: { lat: number; lng: number }) => void;
  flyTo?: { lat: number; lng: number; zoom?: number } | null;
}

export default function LeafletMap({
  center = [35.6762, 139.6503],
  zoom = 12,
  stations,
  pasaSpots = [],
  onLocationFound,
  flyTo,
}: LeafletMapProps) {
  const containerRef       = useRef<HTMLDivElement>(null);
  const mapRef             = useRef<any>(null);
  const LRef               = useRef<any>(null);
  const stationMarkersRef  = useRef<any[]>([]);
  const pasaMarkersRef     = useRef<any[]>([]);
  const userMarkerRef      = useRef<any>(null);
  const onLocationFoundRef = useRef(onLocationFound);
  onLocationFoundRef.current = onLocationFound;

  const [mapReady, setMapReady] = useState(false);

  // ── Init map (one-time, async, cancellation-safe) ─────────────────────────
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
        map.flyTo(e.latlng, 13);
        const userIcon = L.divIcon({
          className: "",
          html: `<div style="background:#3b82f6;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(59,130,246,0.3),0 2px 8px rgba(0,0,0,0.5);"></div>`,
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

      const onResize = () => { try { map.invalidateSize(); } catch {} };
      window.addEventListener("resize", onResize);
      setTimeout(() => { try { map.invalidateSize(); } catch {} }, 300);
      (map as any)._resizeCleanup = () => window.removeEventListener("resize", onResize);

      setMapReady(true);  // triggers markers effect
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
        stationMarkersRef.current = [];
        pasaMarkersRef.current    = [];
        userMarkerRef.current     = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Redraw station markers when map is ready OR stations change ───────────
  useEffect(() => {
    if (!mapReady || !mapRef.current || !LRef.current) return;
    renderStationMarkers(LRef.current, mapRef.current, stations, stationMarkersRef);
  }, [mapReady, stations]);

  // ── Redraw PA/SA markers when map is ready OR pasaSpots change ────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current || !LRef.current) return;
    renderPaSaMarkers(LRef.current, mapRef.current, pasaSpots, pasaMarkersRef);
  }, [mapReady, pasaSpots]);

  // ── External flyTo ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!flyTo || !mapRef.current) return;
    try {
      mapRef.current.stop();
      mapRef.current.flyTo([flyTo.lat, flyTo.lng], flyTo.zoom ?? 15, { duration: 1.0 });
    } catch {}
  }, [flyTo]);

  return (
    <>
      <style>{`
        .dark-popup .leaflet-popup-content-wrapper {
          background: #1e2235; border: 1px solid #2a2f42;
          border-radius: 14px; box-shadow: 0 10px 32px rgba(0,0,0,0.65); padding: 6px;
        }
        .dark-popup .leaflet-popup-tip { background: #1e2235; }
        .dark-popup .leaflet-popup-close-button {
          color: #6b7280 !important; font-size: 18px !important;
          top: 8px !important; right: 10px !important;
        }
        .dark-popup .leaflet-popup-close-button:hover { color: #f0f2f5 !important; }
        .leaflet-container { font-family: system-ui, sans-serif; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      <div ref={containerRef} style={{ width: "100%", height: "100%", background: "#1a1d27" }} />
    </>
  );
}
