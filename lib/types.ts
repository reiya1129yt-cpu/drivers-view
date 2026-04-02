export type FuelType = "regular" | "high_octane" | "diesel" | "ev_charging";

export interface GasStation {
  id: string;
  station_name: string;
  fuel_type: FuelType;
  price: number;
  latitude: number;
  longitude: number;
  comment?: string;
  reported_at: string;
  created_at: string;
}

export interface GasStationInput {
  station_name: string;
  fuel_type: FuelType;
  price: number;
  latitude: number;
  longitude: number;
  comment?: string;
}

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  regular: "レギュラー",
  high_octane: "ハイオク",
  diesel: "軽油",
  ev_charging: "EV充電",
};

export const FUEL_TYPE_COLORS: Record<FuelType, string> = {
  regular: "#22c55e",
  high_octane: "#f59e0b",
  diesel: "#3b82f6",
  ev_charging: "#a855f7",
};

export const FUEL_TYPE_BG: Record<FuelType, string> = {
  regular: "rgba(34,197,94,0.15)",
  high_octane: "rgba(245,158,11,0.15)",
  diesel: "rgba(59,130,246,0.15)",
  ev_charging: "rgba(168,85,247,0.15)",
};
