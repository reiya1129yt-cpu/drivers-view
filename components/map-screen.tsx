"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import DynamicMap from "@/components/dynamic-map";
import type { FuelType, GasStation, PaSaSpot } from "@/lib/types";
import { FUEL_TYPE_LABELS, FUEL_TYPE_COLORS } from "@/lib/types";
import { MOCK_STATIONS, MOCK_PASA } from "@/lib/mock-data"; // v2
import { BannerAd, SearchAd } from "@/components/ad-card";

type FilterType = FuelType | "all" | "pasa";

interface MapScreenProps {
  stations: GasStation[];
  onLocationFound: (latlng: { lat: number; lng: number }) => void;
  userLocation?: { lat: number; lng: number } | null;
  isFavorite?: (id: string) => boolean;
  canAddFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

const FUEL_FILTERS: { id: FilterType; label: string; color: string }[] = [
  { id: "all",         label: "すべて",                     color: "#ef4444" },
  { id: "regular",     label: FUEL_TYPE_LABELS.regular,     color: FUEL_TYPE_COLORS.regular },
  { id: "high_octane", label: FUEL_TYPE_LABELS.high_octane, color: FUEL_TYPE_COLORS.high_octane },
  { id: "diesel",      label: FUEL_TYPE_LABELS.diesel,      color: FUEL_TYPE_COLORS.diesel },
  { id: "ev_charging", label: FUEL_TYPE_LABELS.ev_charging, color: FUEL_TYPE_COLORS.ev_charging },
  { id: "pasa",        label: "PA / SA",                    color: "#f59e0b" },
];

async function geocodePlace(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=ja`,
      { headers: { "User-Agent": "drivers-view/1.0" } }
    );
    const data = await res.json();
    if (data?.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {}
  return null;
}

export default function MapScreen({ stations, onLocationFound, userLocation, isFavorite, canAddFavorite, onToggleFavorite }: MapScreenProps) {
  const [selectedFuel, setSelectedFuel]     = useState<FilterType>("all");
  const [searchQuery, setSearchQuery]       = useState("");
  const [searchOpen, setSearchOpen]         = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [locating, setLocating]             = useState(false);
  const [locationError, setLocationError]   = useState("");
  const [searchCategory, setSearchCategory] = useState<"station" | "price" | "region" | "pasa">("station");
  const [flyTo, setFlyTo]               = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [searching, setSearching]       = useState(false);
  const [searchResults, setSearchResults] = useState<(GasStation | PaSaSpot)[]>([]);
  const [searchError, setSearchError]   = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const SEARCH_CATS = [
    { id: "station" as const, label: "スタンド名" },
    { id: "price"   as const, label: "価格" },
    { id: "region"  as const, label: "エリア" },
    { id: "pasa"    as const, label: "PA / SA" },
  ];

  const allStations: GasStation[] = stations.length > 0 ? stations : MOCK_STATIONS;
  const allPaSa: PaSaSpot[]       = MOCK_PASA;

  const showPaSa      = selectedFuel === "pasa" || selectedFuel === "all";
  const filteredStations: GasStation[] =
    selectedFuel === "all" || selectedFuel === "pasa"
      ? allStations
      : allStations.filter((s) => s.fuel_type === selectedFuel);
  const filteredPaSa: PaSaSpot[] = showPaSa ? allPaSa : [];

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 80);
  }, [searchOpen]);

  const handleSearch = useCallback(async () => {
    const q = searchQuery.trim();
    if (!q) return;
    setSearching(true);
    setSearchError("");
    setSearchResults([]);

    let stationMatches: GasStation[] = [];
    let pasaMatches: PaSaSpot[] = [];

    if (searchCategory === "station") {
      stationMatches = allStations.filter((s) => s.station_name.toLowerCase().includes(q.toLowerCase()));
    } else if (searchCategory === "price") {
      const target = parseFloat(q);
      if (!isNaN(target)) {
        stationMatches = allStations
          .filter((s) => Math.abs(s.price - target) <= 5)
          .sort((a, b) => Math.abs(a.price - target) - Math.abs(b.price - target));
      }
    } else if (searchCategory === "pasa") {
      pasaMatches = allPaSa.filter((p) =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.highway.toLowerCase().includes(q.toLowerCase())
      );
    } else if (searchCategory === "region") {
      // Try geocoding first for region searches
      const geo = await geocodePlace(q);
      if (geo) {
        setFlyTo({ lat: geo.lat, lng: geo.lng, zoom: 13 });
        setSearching(false);
        return;
      }
    }

    const combined = [...stationMatches, ...pasaMatches];
    if (combined.length > 0) {
      setFlyTo({ lat: combined[0].latitude, lng: combined[0].longitude, zoom: 15 });
      setSearchResults(combined.slice(0, 8));
      setSearching(false);
      return;
    }

    // fallback geocode
    const geo = await geocodePlace(q);
    if (geo) {
      setFlyTo({ lat: geo.lat, lng: geo.lng, zoom: 14 });
    } else {
      setSearchError("見つかりませんでした");
    }
    setSearching(false);
  }, [searchQuery, searchCategory, allStations, allPaSa]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); setSearchResults([]); }
  };

  const closeSearch = () => { setSearchOpen(false); setSearchQuery(""); setSearchResults([]); setSearchError(""); };

  return (
    <div style={{ position: "relative", height: "100%", width: "100%", background: "#0f1117" }}>

      {/* ── Opaque top bar ───────────────────────────────────────────────── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 1000,
        background: "#0f1117",
        borderBottom: "1px solid #1e2235",
        boxShadow: "0 3px 14px rgba(0,0,0,0.55)",
      }}>
        {/* Search open state */}
        {searchOpen ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "10px 12px" }}>
            {/* Category selector */}
            <div style={{ display: "flex", gap: 6 }}>
              {SEARCH_CATS.map((c) => (
                <button key={c.id} onClick={() => { setSearchCategory(c.id); setSearchResults([]); setSearchError(""); }} style={{
                  padding: "5px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: "pointer", flexShrink: 0,
                  border: `1.5px solid ${searchCategory === c.id ? "#3b82f6" : "#2a2f42"}`,
                  background: searchCategory === c.id ? "#3b82f622" : "#1a1d27",
                  color: searchCategory === c.id ? "#3b82f6" : "#6b7280",
                }}>{c.label}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{
              flex: 1, display: "flex", alignItems: "center", gap: 8,
              background: "#1e2235", border: "1.5px solid #3b82f6",
              borderRadius: 10, padding: "9px 14px",
            }}>
              {searching ? (
                <svg style={{ width: 15, height: 15, flexShrink: 0, animation: "spin 1s linear infinite" }} viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#2a2f42" strokeWidth="3"/>
                  <path d="M4 12a8 8 0 018-8" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg style={{ width: 15, height: 15, color: "#6b7280", flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                  <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={searchCategory === "price" ? "価格を入力（例: 165）" : searchCategory === "region" ? "エリア名・市区町村" : searchCategory === "pasa" ? "PA/SA名・高速道路名" : "スタンド名で検索"}
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  color: "#f0f2f5", fontSize: 14, caretColor: "#3b82f6",
                }}
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); setSearchResults([]); setSearchError(""); }}
                  style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", padding: 0 }}>
                  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M18 6L6 18M6 6l12 12" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
            <button onClick={closeSearch}
              style={{ background: "none", border: "none", color: "#9ca3af", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", padding: "6px 4px" }}>
              キャンセル
            </button>
            </div>
          </div>
        ) : (
          /* Filter tab bar */
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px" }}>
            <div style={{ flex: 1, display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
              {FUEL_FILTERS.map((f) => {
                const isActive = selectedFuel === f.id;
                const count = f.id === "all"   ? allStations.length + allPaSa.length
                  : f.id === "pasa"            ? allPaSa.length
                  : allStations.filter((s) => s.fuel_type === f.id).length;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFuel(f.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "7px 11px", borderRadius: 8, flexShrink: 0,
                      border: `1.5px solid ${isActive ? f.color : "#2a2f42"}`,
                      background: isActive ? `${f.color}1a` : "#1a1d27",
                      color: isActive ? f.color : "#9ca3af",
                      fontSize: 12, fontWeight: 700, cursor: "pointer",
                      boxShadow: isActive ? `0 0 0 1px ${f.color}44` : "none",
                      transition: "border-color 0.12s, background 0.12s, color 0.12s",
                    }}
                  >
                    <span style={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: isActive ? f.color : "#4b5563", flexShrink: 0,
                    }} />
                    {f.label}
                    <span style={{
                      fontSize: 10, fontWeight: 800, minWidth: 16, textAlign: "center",
                      background: isActive ? `${f.color}28` : "#12151f",
                      color: isActive ? f.color : "#4b5563",
                      padding: "1px 5px", borderRadius: 4,
                    }}>{count}</span>
                  </button>
                );
              })}
            </div>
            <button onClick={() => setSearchOpen(true)} style={{
              flexShrink: 0, width: 36, height: 36, borderRadius: 9,
              background: "#1e2235", border: "1.5px solid #2a2f42",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
              <svg width="15" height="15" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}

        {/* Search results dropdown */}
        {searchOpen && (searchResults.length > 0 || searchError) && (
          <div style={{ borderTop: "1px solid #1e2235", background: "#0f1117" }}>
            {searchError && (
              <div style={{ padding: "12px 16px", color: "#9ca3af", fontSize: 14 }}>{searchError}</div>
            )}
            {searchResults.map((item, i) => {
              const isStation = "fuel_type" in item;
              const color = isStation ? (FUEL_TYPE_COLORS[(item as GasStation).fuel_type] ?? "#ef4444") : "#f59e0b";
              const title = isStation ? (item as GasStation).station_name : (item as PaSaSpot).name;
              const sub   = isStation
                ? `${FUEL_TYPE_LABELS[(item as GasStation).fuel_type]}  ¥${Number((item as GasStation).price).toFixed(0)}`
                : `${(item as PaSaSpot).type}  ${(item as PaSaSpot).highway}`;
              return (
                <React.Fragment key={String(item.id)}>
                  {i === 3 && <SearchAd adIndex={1} />}
                  <button
                    onClick={() => {
                      setFlyTo({ lat: item.latitude, lng: item.longitude, zoom: 15 });
                      closeSearch();
                    }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 12,
                      padding: "11px 16px", background: "none", border: "none",
                      borderBottom: i < searchResults.length - 1 ? "1px solid #1e2235" : "none",
                      cursor: "pointer", textAlign: "left",
                    }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, border: `1px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="14" height="14" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M12 2a7 7 0 017 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 017-7z"/><circle cx="12" cy="9" r="2.5"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#f0f2f5" }}>{title}</div>
                      <div style={{ fontSize: 11, color: color, marginTop: 1 }}>{sub}</div>
                    </div>
                    <svg width="13" height="13" fill="none" stroke="#4b5563" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M9 18l6-6-6-6" strokeLinecap="round"/>
                    </svg>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Banner ad — pinned to bottom, above the map */}
      {!bannerDismissed && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 900 }}>
          <BannerAd adIndex={0} onClose={() => setBannerDismissed(true)} />
        </div>
      )}

      {/* Map — fills remaining space below the header */}
      <div style={{ position: "absolute", inset: 0, top: 60, bottom: bannerDismissed ? 0 : 64 }}>
        <DynamicMap
          stations={filteredStations}
          pasaSpots={filteredPaSa}
          onLocationFound={onLocationFound}
          flyTo={flyTo}
          userLocation={userLocation}
          isFavorite={isFavorite}
          canAddFavorite={canAddFavorite}
          onToggleFavorite={onToggleFavorite}
        />
      </div>
    </div>
  );
}
