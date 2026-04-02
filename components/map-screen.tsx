"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import DynamicMap from "@/components/dynamic-map";
import type { FuelType, GasStation } from "@/lib/types";
import { FUEL_TYPE_LABELS, FUEL_TYPE_COLORS } from "@/lib/types";
import { MOCK_STATIONS } from "@/lib/mock-data"; // mock fallback

type FilterType = FuelType | "all";

interface MapScreenProps {
  stations: GasStation[];
  onLocationFound: (latlng: { lat: number; lng: number }) => void;
}

const FILTERS: { id: FilterType; label: string; icon: string }[] = [
  { id: "all",         label: "すべて",                     icon: "⛽" },
  { id: "regular",     label: FUEL_TYPE_LABELS.regular,     icon: "🟢" },
  { id: "high_octane", label: FUEL_TYPE_LABELS.high_octane, icon: "🟡" },
  { id: "diesel",      label: FUEL_TYPE_LABELS.diesel,      icon: "🔵" },
  { id: "ev_charging", label: FUEL_TYPE_LABELS.ev_charging, icon: "🔌" },
];

// Nominatim geocoder
async function geocodePlace(query: string): Promise<{ lat: number; lng: number; name: string } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=ja`,
      { headers: { "User-Agent": "drivers-view/1.0" } }
    );
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), name: data[0].display_name };
    }
  } catch {}
  return null;
}

export default function MapScreen({ stations, onLocationFound }: MapScreenProps) {
  const [selectedFuel, setSelectedFuel] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery]   = useState("");
  const [searchOpen, setSearchOpen]     = useState(false);
  const [flyTo, setFlyTo]               = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [searching, setSearching]       = useState(false);
  const [searchResults, setSearchResults] = useState<GasStation[]>([]);
  const [searchError, setSearchError]   = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // Use mock stations as fallback so map is never empty
  const allStations = stations.length > 0 ? stations : MOCK_STATIONS;

  const filteredStations =
    selectedFuel === "all"
      ? allStations
      : allStations.filter((s) => s.fuel_type === selectedFuel);

  // Open search and focus input
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 80);
  }, [searchOpen]);

  const handleSearch = useCallback(async () => {
    const q = searchQuery.trim();
    if (!q) return;
    setSearching(true);
    setSearchError("");
    setSearchResults([]);

    // First: search station names locally
    const nameMatches = allStations.filter((s) =>
      s.station_name.toLowerCase().includes(q.toLowerCase())
    );

    if (nameMatches.length > 0) {
      // Fly to first match
      setFlyTo({ lat: nameMatches[0].latitude, lng: nameMatches[0].longitude, zoom: 15 });
      setSearchResults(nameMatches);
      setSearching(false);
      return;
    }

    // Fallback: geocode the area name
    const geo = await geocodePlace(q);
    if (geo) {
      setFlyTo({ lat: geo.lat, lng: geo.lng, zoom: 14 });
      setSearchResults([]);
    } else {
      setSearchError("見つかりませんでした");
    }
    setSearching(false);
  }, [searchQuery, allStations]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); setSearchResults([]); }
  };

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>

      {/* ── Top bar: filter + search toggle ───────────────────────────────── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 1000,
        padding: "12px 12px 10px",
        background: "#0f1117",
        borderBottom: "1px solid #1e2235",
        display: "flex", flexDirection: "column", gap: 8,
        boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
      }}>

        {/* Search bar */}
        {searchOpen ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{
              flex: 1, display: "flex", alignItems: "center", gap: 8,
              background: "#1e2235", border: "1.5px solid #3b82f6",
              borderRadius: 999, padding: "8px 14px",
              boxShadow: "0 4px 16px rgba(59,130,246,0.25)",
            }}>
              {searching ? (
                <svg style={{ width: 16, height: 16, flexShrink: 0, animation: "spin 1s linear infinite" }} viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#2a2f42" strokeWidth="3"/>
                  <path d="M4 12a8 8 0 018-8" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg style={{ width: 16, height: 16, color: "#6b7280", flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                  <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="ガソリンスタンド名・エリアで検索"
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  color: "#f0f2f5", fontSize: 14, caretColor: "#3b82f6",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); setSearchResults([]); setSearchError(""); }}
                  style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", padding: 0, lineHeight: 1 }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={() => { setSearchOpen(false); setSearchQuery(""); setSearchResults([]); setSearchError(""); }}
              style={{ background: "#1e2235", border: "1.5px solid #2a2f42", color: "#9ca3af", borderRadius: 999, padding: "8px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}
            >
              キャンセル
            </button>
          </div>
        ) : (
          /* Filter pills row + search button */
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Solid tab strip — fully opaque, map never bleeds through */}
            <div style={{
              flex: 1, display: "flex", gap: 6, overflowX: "auto",
              scrollbarWidth: "none", paddingBottom: 1,
            }}>
              {FILTERS.map((f) => {
                const isActive = selectedFuel === f.id;
                const color = f.id !== "all" ? FUEL_TYPE_COLORS[f.id as FuelType] : "#ef4444";
                const count = f.id === "all"
                  ? allStations.length
                  : allStations.filter((s) => s.fuel_type === f.id).length;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFuel(f.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "7px 12px",
                      borderRadius: 8,
                      border: `1.5px solid ${isActive ? color : "#2a2f42"}`,
                      background: isActive ? `${color}20` : "#1a1d27",
                      color: isActive ? color : "#9ca3af",
                      fontSize: 12, fontWeight: 700,
                      cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                      boxShadow: isActive ? `0 0 0 1px ${color}55` : "none",
                      transition: "all 0.12s",
                    }}
                  >
                    {f.id !== "all" && (
                      <span style={{
                        width: 7, height: 7, borderRadius: "50%",
                        background: color, flexShrink: 0,
                      }} />
                    )}
                    {f.label}
                    <span style={{
                      fontSize: 10, fontWeight: 800,
                      background: isActive ? `${color}30` : "#12151f",
                      color: isActive ? color : "#4b5563",
                      padding: "1px 6px", borderRadius: 4, minWidth: 18, textAlign: "center",
                    }}>{count}</span>
                  </button>
                );
              })}
            </div>
            {/* Search icon button */}
            <button
              onClick={() => setSearchOpen(true)}
              style={{
                flexShrink: 0, width: 36, height: 36, borderRadius: "50%",
                background: "#1e2235", border: "1.5px solid #2a2f42",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
              }}
            >
              <svg width="16" height="16" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}

        {/* Search results dropdown */}
        {searchOpen && (searchResults.length > 0 || searchError) && (
          <div style={{
            background: "#1e2235", border: "1px solid #2a2f42", borderRadius: 12,
            overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}>
            {searchError && (
              <div style={{ padding: "12px 16px", color: "#9ca3af", fontSize: 14 }}>{searchError}</div>
            )}
            {searchResults.map((s) => {
              const color = FUEL_TYPE_COLORS[s.fuel_type] ?? "#ef4444";
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setFlyTo({ lat: s.latitude, lng: s.longitude, zoom: 15 });
                    setSearchOpen(false);
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 16px", background: "none", border: "none",
                    borderBottom: "1px solid #2a2f42", cursor: "pointer", textAlign: "left",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
                  </svg>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#f0f2f5" }}>{s.station_name}</div>
                    <div style={{ fontSize: 11, color: color, marginTop: 1 }}>{FUEL_TYPE_LABELS[s.fuel_type]} ¥{Number(s.price).toFixed(0)}</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Map */}
      <DynamicMap
        stations={filteredStations}
        onLocationFound={onLocationFound}
        flyTo={flyTo}
      />
    </div>
  );
}
