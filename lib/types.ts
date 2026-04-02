export type FuelType = "regular" | "high_octane" | "diesel" | "ev_charging";

export interface GasStation {
  id: string;
  station_name: string;
  fuel_type: FuelType;
  price: number;
  latitude: number;
  longitude: number;
  comment?: string | null;
  reported_at: string;
  created_at: string;
  /** true when a user has submitted a price report for this station */
  has_user_price?: boolean;
}

export interface GasStationInput {
  station_name: string;
  fuel_type: FuelType;
  price: number;
  latitude: number;
  longitude: number;
  comment?: string;
}

export type PaSaStatus = "open" | "closed";
export type CongestionLevel = "normal" | "busy" | "very_busy";

export interface PaSaSpot {
  id: string;
  name: string;
  type: "PA" | "SA";
  latitude: number;
  longitude: number;
  status: PaSaStatus;
  congestion: CongestionLevel;
  highway: string;
  facilities: string[];
}

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  regular:     "レギュラー",
  high_octane: "ハイオク",
  diesel:      "軽油",
  ev_charging: "EV充電",
};

export const FUEL_TYPE_COLORS: Record<FuelType, string> = {
  regular:     "#ef4444",  // RED  — gas stations
  high_octane: "#f97316",  // ORANGE
  diesel:      "#3b82f6",  // BLUE
  ev_charging: "#a855f7",  // PURPLE — EV
};

export const FUEL_TYPE_BG: Record<FuelType, string> = {
  regular:     "rgba(239,68,68,0.15)",
  high_octane: "rgba(249,115,22,0.15)",
  diesel:      "rgba(59,130,246,0.15)",
  ev_charging: "rgba(168,85,247,0.15)",
};

export const CONGESTION_LABELS: Record<CongestionLevel, string> = {
  normal:   "空き",
  busy:     "混雑",
  very_busy: "大混雑",
};

export const CONGESTION_COLORS: Record<CongestionLevel, string> = {
  normal:   "#22c55e",
  busy:     "#f59e0b",
  very_busy: "#ef4444",
};
