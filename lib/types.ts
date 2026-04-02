export type FuelType = "regular" | "high_octane" | "diesel";

export interface GasStation {
  id: string;
  station_name: string;
  fuel_type: FuelType;
  price: number;
  latitude: number;
  longitude: number;
  reported_at: string;
  created_at: string;
}

export interface GasStationInput {
  station_name: string;
  fuel_type: FuelType;
  price: number;
  latitude: number;
  longitude: number;
}

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  regular: "Regular",
  high_octane: "High Octane",
  diesel: "Diesel",
};

export const FUEL_TYPE_COLORS: Record<FuelType, string> = {
  regular: "#22c55e", // green
  high_octane: "#eab308", // yellow
  diesel: "#3b82f6", // blue
};
