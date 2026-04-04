import type { GasStation, PaSaSpot, FuelType } from "@/lib/types";

/** Generate mock gas stations centered on the given lat/lng (within ~1.5 km radius) */
export function generateNearbyStations(lat: number, lng: number): GasStation[] {
  const now = new Date().toISOString();
  const offsets: [number, number, string, FuelType, number, string | null][] = [
    [ 0.004,  0.006, "コスモ石油 近隣店",      "regular",     165, "セルフ"      ],
    [-0.006,  0.002, "Shell スタンド",          "regular",     162, null          ],
    [ 0.002, -0.008, "ENEOS 近くのSS",          "regular",     168, "24h営業"    ],
    [ 0.009,  0.004, "出光 付近SS",             "regular",     160, null          ],
    [-0.004, -0.005, "apollostation 周辺",       "high_octane", 179, "会員割引あり"],
    [ 0.007, -0.003, "コスモ ハイオク店",       "high_octane", 176, null          ],
    [-0.009,  0.007, "ENEOS 軽油スタンド",      "diesel",      148, "大型対応"   ],
    [ 0.005,  0.010, "出光 ディーゼル",         "diesel",      145, null          ],
    [-0.003,  0.011, "ENEOSでんき EV充電",      "ev_charging",  55, "急速50kW"   ],
  ];
  return offsets.map(([dlat, dlng, name, fuel, price, comment], i) => ({
    id:           `nearby_${i}`,
    station_name: name,
    fuel_type:    fuel,
    price,
    latitude:     lat + dlat,
    longitude:    lng + dlng,
    comment,
    reported_at:  now,
    created_at:   now,
    has_user_price: i % 3 === 0,
  }));
}

const now = new Date().toISOString();

export const MOCK_STATIONS: GasStation[] = [
  // Regular (RED)
  { id: "m1",  station_name: "コスモ石油 渋谷店",        fuel_type: "regular",     price: 165, latitude: 35.6580, longitude: 139.7016, comment: "セルフ",        reported_at: now, created_at: now, has_user_price: true,  has_car_wash: true,  opening_hours: "24時間営業" },
  { id: "m2",  station_name: "Shell 池袋店",              fuel_type: "regular",     price: 168, latitude: 35.7295, longitude: 139.7107, comment: null,           reported_at: now, created_at: now,                         has_car_wash: false, opening_hours: "7:00 - 22:00" },
  { id: "m3",  station_name: "ENEOS 代官山SS",            fuel_type: "regular",     price: 163, latitude: 35.6488, longitude: 139.7036, comment: null,           reported_at: now, created_at: now,                         has_car_wash: true,  opening_hours: "8:00 - 21:00" },
  { id: "m4",  station_name: "出光 上野SS",               fuel_type: "regular",     price: 161, latitude: 35.7146, longitude: 139.7748, comment: "24h営業",      reported_at: now, created_at: now, has_user_price: true,  has_car_wash: null,  opening_hours: "24時間営業" },
  { id: "m5",  station_name: "ENEOS 中野坂上SS",          fuel_type: "regular",     price: 166, latitude: 35.7023, longitude: 139.6636, comment: null,           reported_at: now, created_at: now,                         has_car_wash: false, opening_hours: null },
  // High-octane (ORANGE)
  { id: "m6",  station_name: "出光 新宿西口SS",           fuel_type: "high_octane", price: 176, latitude: 35.6896, longitude: 139.6917, comment: null,           reported_at: now, created_at: now,                         has_car_wash: true,  opening_hours: "24時間営業" },
  { id: "m7",  station_name: "apollostation 品川",        fuel_type: "high_octane", price: 179, latitude: 35.6204, longitude: 139.7339, comment: "会員割引あり",  reported_at: now, created_at: now, has_user_price: true,  has_car_wash: true,  opening_hours: "6:00 - 23:00" },
  { id: "m8",  station_name: "コスモ 自由が丘SS",         fuel_type: "high_octane", price: 174, latitude: 35.6083, longitude: 139.6681, comment: null,           reported_at: now, created_at: now,                         has_car_wash: null,  opening_hours: "7:00 - 21:00" },
  // Diesel (BLUE)
  { id: "m9",  station_name: "ENEOS 青山通り店",          fuel_type: "diesel",      price: 148, latitude: 35.6705, longitude: 139.7158, comment: "24時間営業",    reported_at: now, created_at: now,                         has_car_wash: false, opening_hours: "24時間営業" },
  { id: "m10", station_name: "コスモ 上野SS",             fuel_type: "diesel",      price: 145, latitude: 35.7146, longitude: 139.7748, comment: "深夜割増なし",  reported_at: now, created_at: now,                         has_car_wash: true,  opening_hours: "7:00 - 22:00" },
  { id: "m11", station_name: "出光 有明SS",               fuel_type: "diesel",      price: 150, latitude: 35.6250, longitude: 139.7925, comment: null,           reported_at: now, created_at: now,                         has_car_wash: null,  opening_hours: null },
  // EV Charging (PURPLE)
  { id: "m12", station_name: "ENEOSでんき 六本木",        fuel_type: "ev_charging", price: 55,  latitude: 35.6641, longitude: 139.7316, comment: "急速充電 50kW", reported_at: now, created_at: now,                         has_car_wash: false, opening_hours: "24時間営業" },
  { id: "m13", station_name: "日産EVステーション 東京駅", fuel_type: "ev_charging", price: 49,  latitude: 35.6812, longitude: 139.7671, comment: "要会員登録",    reported_at: now, created_at: now,                         has_car_wash: null,  opening_hours: "9:00 - 20:00" },
  { id: "m14", station_name: "テスラ スーパーチャージャー 渋谷", fuel_type: "ev_charging", price: 62, latitude: 35.6617, longitude: 139.6995, comment: "Tesla専用", reported_at: now, created_at: now,                      has_car_wash: false, opening_hours: "24時間営業" },
];

export const MOCK_PASA: PaSaSpot[] = [
  {
    id: "pa1", name: "海老名SA", type: "SA",
    latitude: 35.4489, longitude: 139.3894,
    status: "open", congestion: "busy",
    highway: "東名高速", facilities: ["レストラン", "コンビニ", "ガソリンスタンド", "EV充電"],
  },
  {
    id: "pa2", name: "足柄SA", type: "SA",
    latitude: 35.3208, longitude: 138.9378,
    status: "open", congestion: "normal",
    highway: "東名高速", facilities: ["フードコート", "お土産", "ガソリンスタンド"],
  },
  {
    id: "pa3", name: "羽生PA", type: "PA",
    latitude: 36.1774, longitude: 139.5573,
    status: "open", congestion: "very_busy",
    highway: "東北自動車道", facilities: ["コンビニ", "トイレ", "EV充電"],
  },
  {
    id: "pa4", name: "港北PA", type: "PA",
    latitude: 35.5389, longitude: 139.5899,
    status: "open", congestion: "normal",
    highway: "第三京浜", facilities: ["トイレ", "自販機"],
  },
  {
    id: "pa5", name: "横浜町田IC付近SA", type: "SA",
    latitude: 35.5153, longitude: 139.4589,
    status: "closed", congestion: "normal",
    highway: "東名高速", facilities: ["レストラン", "ガソリンスタンド"],
  },
];
