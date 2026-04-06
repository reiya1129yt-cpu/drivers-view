import { NextRequest, NextResponse } from "next/server";
import type { GasStation, FuelType } from "@/lib/types";

// Overpass API — fetch all fuel stations within a bounding box
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

// Map OSM fuel values to our FuelType
function osmFuelToType(tags: Record<string, string>): FuelType {
  const fuel = tags["fuel:diesel"] === "yes" ? "diesel"
    : tags["fuel:octane_100"] === "yes" || tags["fuel:e10"] === "yes" ? "high_octane"
    : tags["amenity"] === "charging_station" ? "ev_charging"
    : "regular";
  return fuel;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat  = parseFloat(searchParams.get("lat")  ?? "35.6762");
  const lng  = parseFloat(searchParams.get("lng")  ?? "139.6503");
  const radius = parseFloat(searchParams.get("radius") ?? "5000"); // metres

  // Build bounding box from centre + radius (rough approximation)
  const latDelta = radius / 111320;
  const lngDelta = radius / (111320 * Math.cos((lat * Math.PI) / 180));
  const south = lat - latDelta;
  const north = lat + latDelta;
  const west  = lng - lngDelta;
  const east  = lng + lngDelta;

  const query = `
[out:json][timeout:15];
(
  node["amenity"="fuel"](${south},${west},${north},${east});
  node["amenity"="charging_station"](${south},${west},${north},${east});
);
out body;
`;

  try {
    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
      next: { revalidate: 300 }, // cache 5 minutes
    });

    if (!res.ok) {
      return NextResponse.json({ stations: [] }, { status: 200 });
    }

    const data = await res.json();
    const elements: any[] = data.elements ?? [];

    const stations: GasStation[] = elements
      .filter((el) => el.lat && el.lon)
      .map((el) => {
        const tags: Record<string, string> = el.tags ?? {};
        const name =
          tags["name"] ||
          tags["brand"] ||
          tags["operator"] ||
          (tags["amenity"] === "charging_station" ? "EV充電スタンド" : "ガソリンスタンド");
        const fuelType = osmFuelToType(tags);

        return {
          id: `osm_${el.id}`,
          station_name: name,
          fuel_type: fuelType,
          price: 0, // no price — will be overlaid from user posts
          latitude: el.lat,
          longitude: el.lon,
          reported_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          has_user_price: false,
          has_price: false, // OSM-only, no post yet
          comment: null,
          opening_hours: tags["opening_hours"] ?? null,
          has_car_wash: tags["car_wash"] === "yes" ? true : null,
        } as GasStation & { has_price: boolean };
      });

    return NextResponse.json({ stations });
  } catch (err) {
    console.error("[v0] OSM fetch error:", err);
    return NextResponse.json({ stations: [] }, { status: 200 });
  }
}
