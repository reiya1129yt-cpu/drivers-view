import type { GasStation } from "@/lib/types";

export const MOCK_STATIONS: GasStation[] = [
  { id: "m1", station_name: "コスモ石油 渋谷店",        fuel_type: "regular",     price: 165, latitude: 35.6580, longitude: 139.7016, comment: "セルフ",        reported_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: "m2", station_name: "出光 新宿西口SS",           fuel_type: "high_octane", price: 176, latitude: 35.6896, longitude: 139.6917, comment: null,           reported_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: "m3", station_name: "ENEOS 青山通り店",          fuel_type: "diesel",      price: 148, latitude: 35.6705, longitude: 139.7158, comment: "24時間営業",    reported_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: "m4", station_name: "Shell 池袋店",              fuel_type: "regular",     price: 168, latitude: 35.7295, longitude: 139.7107, comment: null,           reported_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: "m5", station_name: "apollostation 品川",        fuel_type: "high_octane", price: 179, latitude: 35.6204, longitude: 139.7339, comment: "会員割引あり",  reported_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: "m6", station_name: "ENEOSでんき 六本木",        fuel_type: "ev_charging", price: 55,  latitude: 35.6641, longitude: 139.7316, comment: "急速充電 50kW", reported_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: "m7", station_name: "日産EVステーション 東京駅", fuel_type: "ev_charging", price: 49,  latitude: 35.6812, longitude: 139.7671, comment: "要会員登録",    reported_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: "m8", station_name: "ENEOS 代官山SS",            fuel_type: "regular",     price: 163, latitude: 35.6488, longitude: 139.7036, comment: null,           reported_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: "m9", station_name: "コスモ 上野SS",             fuel_type: "diesel",      price: 145, latitude: 35.7146, longitude: 139.7748, comment: "深夜割増なし",  reported_at: new Date().toISOString(), created_at: new Date().toISOString() },
];
