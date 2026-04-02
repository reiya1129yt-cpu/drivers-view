"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { GasStation } from "@/lib/types";
import { FUEL_TYPE_LABELS, FUEL_TYPE_COLORS, FUEL_TYPE_BG } from "@/lib/types";

function createFuelIcon(station: GasStation) {
  const color = FUEL_TYPE_COLORS[station.fuel_type];
  const label = FUEL_TYPE_LABELS[station.fuel_type];

  return L.divIcon({
    className: "custom-fuel-marker",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="
          background:#1a1d27;
          border:2px solid ${color};
          border-radius:10px;
          padding:5px 9px;
          box-shadow:0 2px 12px rgba(0,0,0,0.5);
          min-width:64px;
          text-align:center;
        ">
          <div style="font-size:14px;font-weight:700;color:${color};line-height:1.2;white-space:nowrap;">
            ¥${Number(station.price).toFixed(0)}
          </div>
          <div style="font-size:9px;color:#9ca3af;margin-top:1px;white-space:nowrap;">
            ${label}
          </div>
        </div>
        <div style="
          width:0;height:0;
          border-left:5px solid transparent;
          border-right:5px solid transparent;
          border-top:6px solid ${color};
        "></div>
      </div>
    `,
    iconSize: [70, 54],
    iconAnchor: [35, 54],
    popupAnchor: [0, -58],
  });
}

export default function GasStationMarker({ station }: { station: GasStation }) {
  const color = FUEL_TYPE_COLORS[station.fuel_type];
  const bg = FUEL_TYPE_BG[station.fuel_type];
  const label = FUEL_TYPE_LABELS[station.fuel_type];
  const icon = createFuelIcon(station);

  const reportedDate = new Date(station.reported_at).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Marker position={[station.latitude, station.longitude]} icon={icon}>
      <Popup>
        <div style={{ minWidth: "190px" }}>
          <div style={{ fontWeight: 700, fontSize: "15px", color: "#f0f2f5", marginBottom: "8px", lineHeight: 1.3 }}>
            {station.station_name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{
              background: bg,
              color,
              padding: "2px 8px",
              borderRadius: "20px",
              fontSize: "11px",
              fontWeight: 600,
              border: `1px solid ${color}44`,
            }}>
              {label}
            </span>
            <span style={{ fontSize: "22px", fontWeight: 700, color }}>
              ¥{Number(station.price).toFixed(0)}
            </span>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>/L</span>
          </div>
          {station.comment && (
            <div style={{
              fontSize: "12px",
              color: "#9ca3af",
              background: "#22263a",
              padding: "6px 8px",
              borderRadius: "6px",
              marginBottom: "6px",
            }}>
              {station.comment}
            </div>
          )}
          <div style={{ fontSize: "11px", color: "#6b7280" }}>
            {reportedDate} 更新
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
