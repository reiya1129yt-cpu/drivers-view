import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { PlaceType, PlaceWithPrices, BusinessStatus, CongestionLevel } from "@/lib/types";

// Generate sample prices for gas stations
function generateSamplePrices() {
  const baseRegular = 165 + Math.floor(Math.random() * 10);
  return {
    regular: baseRegular,
    high_octane: baseRegular + 11 + Math.floor(Math.random() * 3),
    diesel: baseRegular - 15 + Math.floor(Math.random() * 5),
    kerosene: 105 + Math.floor(Math.random() * 10),
  };
}

// Generate random business status based on time
function getBusinessStatus(): BusinessStatus {
  const hour = new Date().getHours();
  if (hour >= 7 && hour < 22) {
    return Math.random() > 0.1 ? "open" : "outside_hours";
  }
  return Math.random() > 0.7 ? "open" : "outside_hours";
}

// Generate random congestion level
function getCongestionLevel(): CongestionLevel {
  const rand = Math.random();
  if (rand < 0.4) return "empty";
  if (rand < 0.8) return "normal";
  return "crowded";
}

// Generate fallback sample spots around a given center
function generateFallbackPlaces(
  centerLat: number,
  centerLon: number,
  types: PlaceType[]
): PlaceWithPrices[] {
  const fallbackPlaces: PlaceWithPrices[] = [];
  
  // Gas station brands commonly found in Japan
  const gasStationBrands = ["ENEOS", "出光", "コスモ石油", "昭和シェル", "キグナス"];
  
  // Generate 5 gas stations if requested
  if (types.includes("gas_station")) {
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * 2 * Math.PI;
      const distance = 0.005 + Math.random() * 0.01; // ~500m to 1.5km
      const lat = centerLat + distance * Math.cos(angle);
      const lon = centerLon + distance * Math.sin(angle) / Math.cos(centerLat * Math.PI / 180);
      const brand = gasStationBrands[i % gasStationBrands.length];
      
      const hasCarWash = Math.random() > 0.3;
      const hasTirePressure = Math.random() > 0.4;
      const is24Hours = Math.random() > 0.7;
      
      fallbackPlaces.push({
        id: `fallback-gs-${i}`,
        osm_id: null,
        name: `${brand} ${["新宿", "渋谷", "池袋", "品川", "上野"][i]}SS`,
        place_type: "gas_station",
        latitude: lat,
        longitude: lon,
        address: `東京都${["新宿区", "渋谷区", "豊島区", "港区", "台東区"][i]}`,
        brand,
        amenities: [
          ...(hasCarWash ? ["洗車"] : []),
          ...(hasTirePressure ? ["タイヤ空気圧"] : []),
          ...(is24Hours ? ["24時間営業"] : []),
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        latest_prices: generateSamplePrices(),
        has_car_wash: hasCarWash,
        has_tire_pressure: hasTirePressure,
        business_hours: is24Hours ? "24時間" : `${7 + Math.floor(Math.random() * 2)}:00〜${20 + Math.floor(Math.random() * 3)}:00`,
        business_status: getBusinessStatus(),
      });
    }
  }
  
  // Generate 2 PA/SA if requested
  if (types.includes("pa_sa")) {
    const paSaNames = ["サービスエリア", "パーキングエリア"];
    for (let i = 0; i < 2; i++) {
      const angle = ((i + 5) / 7) * 2 * Math.PI;
      const distance = 0.015 + Math.random() * 0.01; // ~1.5km to 2.5km
      const lat = centerLat + distance * Math.cos(angle);
      const lon = centerLon + distance * Math.sin(angle) / Math.cos(centerLat * Math.PI / 180);
      
      fallbackPlaces.push({
        id: `fallback-pa-${i}`,
        osm_id: null,
        name: `${["東京", "神奈川"][i]}${paSaNames[i]}`,
        place_type: "pa_sa",
        latitude: lat,
        longitude: lon,
        address: `${["東京都", "神奈川県"][i]}高速道路`,
        brand: null,
        amenities: ["レストラン", "トイレ", "コンビニ", "ガソリンスタンド"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        latest_prices: generateSamplePrices(),
        has_car_wash: true,
        has_tire_pressure: true,
        business_hours: "24時間",
        business_status: "open",
        congestion_level: getCongestionLevel(),
        toilet_available: true,
        is_closed: false,
      });
    }
  }
  
  // Generate 2 EV charging if requested
  if (types.includes("ev_charging")) {
    const evNames = ["急速充電ステーション", "EV充電スポット"];
    for (let i = 0; i < 2; i++) {
      const angle = ((i + 3) / 5) * 2 * Math.PI;
      const distance = 0.008 + Math.random() * 0.01; // ~800m to 1.8km
      const lat = centerLat + distance * Math.cos(angle);
      const lon = centerLon + distance * Math.sin(angle) / Math.cos(centerLat * Math.PI / 180);
      
      const is24Hours = Math.random() > 0.3;
      
      fallbackPlaces.push({
        id: `fallback-ev-${i}`,
        osm_id: null,
        name: `${["イオン", "セブンパーク"][i]} ${evNames[i]}`,
        place_type: "ev_charging",
        latitude: lat,
        longitude: lon,
        address: `東京都${["江東区", "世田谷区"][i]}`,
        brand: i === 0 ? "Tesla" : "CHAdeMO",
        amenities: [
          ...(is24Hours ? ["24時間"] : []),
          "急速充電",
          "普通充電",
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        latest_prices: {},
        has_car_wash: false,
        has_tire_pressure: false,
        business_hours: is24Hours ? "24時間" : "9:00〜21:00",
        business_status: getBusinessStatus(),
      });
    }
  }
  
  return fallbackPlaces;
}

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    brand?: string;
    "addr:full"?: string;
    "addr:city"?: string;
    "addr:street"?: string;
    amenity?: string;
    highway?: string;
    shop?: string;
  };
}

interface OverpassResponse {
  elements: OverpassElement[];
}

// Map OSM tags to our place types
function getPlaceType(element: OverpassElement): PlaceType | null {
  const tags = element.tags || {};
  
  // Gas stations
  if (tags.amenity === "fuel") {
    return "gas_station";
  }
  
  // EV charging
  if (tags.amenity === "charging_station") {
    return "ev_charging";
  }
  
  // PA/SA (Service areas and rest areas in Japan)
  if (
    tags.highway === "services" ||
    tags.highway === "rest_area" ||
    (tags.name && (tags.name.includes("SA") || tags.name.includes("PA") || tags.name.includes("サービスエリア") || tags.name.includes("パーキングエリア")))
  ) {
    return "pa_sa";
  }
  
  return null;
}

// Build Overpass query based on requested types
function buildOverpassQuery(
  south: number,
  west: number,
  north: number,
  east: number,
  types: PlaceType[]
): string {
  const queries: string[] = [];
  
  if (types.includes("gas_station")) {
    queries.push(`node["amenity"="fuel"](${south},${west},${north},${east});`);
    queries.push(`way["amenity"="fuel"](${south},${west},${north},${east});`);
  }
  
  if (types.includes("ev_charging")) {
    queries.push(`node["amenity"="charging_station"](${south},${west},${north},${east});`);
    queries.push(`way["amenity"="charging_station"](${south},${west},${north},${east});`);
  }
  
  if (types.includes("pa_sa")) {
    queries.push(`node["highway"="services"](${south},${west},${north},${east});`);
    queries.push(`way["highway"="services"](${south},${west},${north},${east});`);
    queries.push(`node["highway"="rest_area"](${south},${west},${north},${east});`);
    queries.push(`way["highway"="rest_area"](${south},${west},${north},${east});`);
  }
  
  return `[out:json][timeout:25];(${queries.join("")});out center;`;
}

// Fetch places from Overpass API with fallback endpoints and timeout
async function fetchFromOverpass(
  south: number,
  west: number,
  north: number,
  east: number,
  types: PlaceType[]
): Promise<PlaceWithPrices[]> {
  const query = buildOverpassQuery(south, west, north, east, types);
  
  // Try multiple Overpass API endpoints with shorter timeout
  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
  ];
  
  for (const endpoint of endpoints) {
    try {
      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "DriversView/1.0",
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`Overpass API error from ${endpoint}:`, response.status);
        continue; // Try next endpoint
      }
      
      const data: OverpassResponse = await response.json();
    
    return data.elements
      .map((element) => {
        const placeType = getPlaceType(element);
        if (!placeType) return null;
        
        const lat = element.lat ?? element.center?.lat;
        const lon = element.lon ?? element.center?.lon;
        
        if (!lat || !lon) return null;
        
        const tags = element.tags || {};
        const name = tags.name || (placeType === "gas_station" ? (tags.brand || "ガソリンスタンド") : (placeType === "ev_charging" ? "EV充電スポット" : "PA/SA"));
        
        const address = tags["addr:full"] || (tags["addr:city"] && tags["addr:street"] ? `${tags["addr:city"]}${tags["addr:street"]}` : null);
        
        // Generate sample data for display
        const hasCarWash = Math.random() > 0.4;
        const hasTirePressure = Math.random() > 0.5;
        const is24Hours = Math.random() > 0.6;
        
        const basePlace = {
          id: `osm-${element.type}-${element.id}`,
          osm_id: `${element.type}/${element.id}`,
          name,
          place_type: placeType,
          latitude: lat,
          longitude: lon,
          address,
          brand: tags.brand || null,
          amenities: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          has_car_wash: placeType !== "ev_charging" ? hasCarWash : false,
          has_tire_pressure: placeType !== "ev_charging" ? hasTirePressure : false,
          business_hours: is24Hours ? "24時間" : `${7 + Math.floor(Math.random() * 2)}:00〜${20 + Math.floor(Math.random() * 3)}:00`,
          business_status: getBusinessStatus(),
        };
        
        if (placeType === "gas_station") {
          return {
            ...basePlace,
            latest_prices: generateSamplePrices(),
          } as PlaceWithPrices;
        } else if (placeType === "pa_sa") {
          return {
            ...basePlace,
            latest_prices: generateSamplePrices(),
            congestion_level: getCongestionLevel(),
            toilet_available: true,
            is_closed: false,
          } as PlaceWithPrices;
        } else {
          return {
            ...basePlace,
            latest_prices: {},
          } as PlaceWithPrices;
        }
      })
      .filter((place): place is PlaceWithPrices => place !== null);
    } catch (error) {
      // Silently try next endpoint on error/timeout
      continue;
    }
  }
  
  // All endpoints failed
  return [];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const north = parseFloat(searchParams.get("north") || "0");
  const south = parseFloat(searchParams.get("south") || "0");
  const east = parseFloat(searchParams.get("east") || "0");
  const west = parseFloat(searchParams.get("west") || "0");
  const types = (searchParams.get("types")?.split(",") || [
    "gas_station",
    "pa_sa",
    "ev_charging",
  ]) as PlaceType[];

  const centerLat = (north + south) / 2;
  const centerLon = (east + west) / 2;

  try {
    const supabase = await createClient();
    
    // Fetch from Overpass API (OSM data)
    const osmPlaces = await fetchFromOverpass(south, west, north, east, types);
    
    // Fetch from our database (for places with user-submitted prices)
    const { data: dbPlaces, error: placesError } = await supabase
      .from("places")
      .select("*")
      .gte("latitude", south)
      .lte("latitude", north)
      .gte("longitude", west)
      .lte("longitude", east)
      .in("place_type", types)
      .limit(100);

    if (placesError) {
      console.error("Database error:", placesError);
    }

    // Get OSM IDs from our database places to avoid duplicates
    const dbOsmIds = new Set((dbPlaces || []).map((p) => p.osm_id).filter(Boolean));
    
    // Filter out OSM places that are already in our database
    const uniqueOsmPlaces = osmPlaces.filter(
      (place) => !dbOsmIds.has(place.osm_id)
    );

    // Combine database places and unique OSM places
    let allPlaces = [...(dbPlaces || []), ...uniqueOsmPlaces];
    
    // If no places found, generate fallback data
    if (allPlaces.length === 0) {
      allPlaces = generateFallbackPlaces(centerLat, centerLon, types);
    }

    // Get latest prices for gas stations from our database
    const gasStationDbIds = (dbPlaces || [])
      .filter((p) => p.place_type === "gas_station")
      .map((p) => p.id);

    let pricesMap: Record<
      string,
      { regular?: number; high_octane?: number; diesel?: number; kerosene?: number; updated_at?: string }
    > = {};

    if (gasStationDbIds.length > 0) {
      const { data: prices } = await supabase
        .from("price_posts")
        .select("*")
        .in("place_id", gasStationDbIds)
        .order("created_at", { ascending: false });

      if (prices) {
        prices.forEach((price) => {
          if (!pricesMap[price.place_id]) {
            pricesMap[price.place_id] = {};
          }
          const fuelKey = price.fuel_type as keyof Omit<typeof pricesMap[string], 'updated_at'>;
          if (!pricesMap[price.place_id][fuelKey]) {
            pricesMap[price.place_id][fuelKey] = price.price;
            if (!pricesMap[price.place_id].updated_at || price.created_at > pricesMap[price.place_id].updated_at!) {
              pricesMap[price.place_id].updated_at = price.created_at;
            }
          }
        });
      }
    }

    // Combine places with prices
    const placesWithPrices: PlaceWithPrices[] = allPlaces.map((place) => ({
      ...place,
      latest_prices: pricesMap[place.id] || {},
    }));

    // Sort by distance from center of bounds (using centerLat/centerLon already defined above)
    placesWithPrices.sort((a, b) => {
      const distA = Math.pow(a.latitude - centerLat, 2) + Math.pow(a.longitude - centerLon, 2);
      const distB = Math.pow(b.latitude - centerLat, 2) + Math.pow(b.longitude - centerLon, 2);
      return distA - distB;
    });

    // Limit to 100 places
    return NextResponse.json({ places: placesWithPrices.slice(0, 100) });
  } catch (error) {
    console.error("Error fetching places:", error);
    return NextResponse.json(
      { error: "Failed to fetch places" },
      { status: 500 }
    );
  }
}
