export type PlaceType = "gas_station" | "pa_sa" | "ev_charging";

export type FuelType = "regular" | "high_octane" | "diesel" | "kerosene";

export interface Place {
  id: string;
  osm_id: string | null;
  name: string;
  place_type: PlaceType;
  latitude: number;
  longitude: number;
  address: string | null;
  brand: string | null;
  amenities: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface PricePost {
  id: string;
  place_id: string;
  user_id: string;
  fuel_type: FuelType;
  price: number;
  created_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  points: number;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlaceWithPrices extends Place {
  latest_prices: {
    regular?: number;
    high_octane?: number;
    diesel?: number;
    kerosene?: number;
    updated_at?: string;
  };
}

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  regular: "レギュラー",
  high_octane: "ハイオク",
  diesel: "軽油",
  kerosene: "灯油",
};

export const PLACE_TYPE_LABELS: Record<PlaceType, string> = {
  gas_station: "ガソリンスタンド",
  pa_sa: "PA/SA",
  ev_charging: "EV充電スポット",
};

export const PLACE_TYPE_ICONS: Record<PlaceType, string> = {
  gas_station: "fuel",
  pa_sa: "parking",
  ev_charging: "zap",
};
