"use client";

import { useState, useEffect, useCallback } from "react";
import type { GasStation } from "@/lib/types";

const MAX_FAVORITES = 3;
const STORAGE_KEY   = "dv_favorites";
const PRICES_KEY    = "dv_fav_prices";

export interface PriceAlert {
  id: string;
  stationName: string;
  oldPrice: number;
  newPrice: number;
  fuelType: string;
}

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(localStorage.getItem(key) ?? "") as T; } catch { return fallback; }
}

export function useFavorites(stations: GasStation[]) {
  const [favorites, setFavorites] = useState<string[]>(() => load<string[]>(STORAGE_KEY, []));
  const [alerts, setAlerts]       = useState<PriceAlert[]>([]);

  // Persist favorites
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // Detect price changes for favorited stations
  useEffect(() => {
    const savedPrices = load<Record<string, number>>(PRICES_KEY, {});
    const newAlerts: PriceAlert[] = [];
    const updatedPrices: Record<string, number> = { ...savedPrices };

    favorites.forEach((id) => {
      const station = stations.find((s) => s.id === id);
      if (!station) return;
      const prev = savedPrices[id];
      if (prev !== undefined && prev !== station.price) {
        newAlerts.push({
          id,
          stationName: station.station_name,
          oldPrice: prev,
          newPrice: station.price,
          fuelType: station.fuel_type,
        });
      }
      updatedPrices[id] = station.price;
    });

    localStorage.setItem(PRICES_KEY, JSON.stringify(updatedPrices));
    if (newAlerts.length > 0) setAlerts((prev) => [...prev, ...newAlerts]);
  }, [stations, favorites]);

  const toggle = useCallback((id: string) => {
    setFavorites((prev) => {
      if (prev.includes(id)) return prev.filter((f) => f !== id);
      if (prev.length >= MAX_FAVORITES) return prev; // limit reached
      return [...prev, id];
    });
  }, []);

  const isFavorite   = useCallback((id: string) => favorites.includes(id), [favorites]);
  const canAdd       = favorites.length < MAX_FAVORITES;
  const dismissAlert = useCallback((id: string) => setAlerts((prev) => prev.filter((a) => a.id !== id)), []);

  return { favorites, toggle, isFavorite, canAdd, alerts, dismissAlert };
}
