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

export type BusinessStatus = "open" | "closed" | "outside_hours";
export type CongestionLevel = "empty" | "normal" | "crowded";

export interface PlaceWithPrices extends Place {
  latest_prices: {
    regular?: number;
    high_octane?: number;
    diesel?: number;
    kerosene?: number;
    updated_at?: string;
  };
  // New fields for detailed info
  has_car_wash?: boolean;
  has_tire_pressure?: boolean;
  business_hours?: string; // "24時間" or "7:00〜22:00"
  business_status?: BusinessStatus;
  // PA/SA specific
  congestion_level?: CongestionLevel;
  toilet_available?: boolean;
  is_closed?: boolean;
}

export const BUSINESS_STATUS_LABELS: Record<BusinessStatus, string> = {
  open: "営業中",
  closed: "閉鎖中",
  outside_hours: "営業時間外",
};

export const CONGESTION_LABELS: Record<CongestionLevel, string> = {
  empty: "空いてる",
  normal: "普通",
  crowded: "混雑",
};

export const CONGESTION_COLORS: Record<CongestionLevel, string> = {
  empty: "text-green-400",
  normal: "text-yellow-400",
  crowded: "text-red-400",
};

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
