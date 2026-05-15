import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const north = parseFloat(searchParams.get("north") || "0");
  const south = parseFloat(searchParams.get("south") || "0");
  const east = parseFloat(searchParams.get("east") || "0");
  const west = parseFloat(searchParams.get("west") || "0");
  const types = searchParams.get("types")?.split(",") || [
    "gas_station",
    "pa_sa",
    "ev_charging",
  ];

  try {
    const supabase = await createClient();

    // Get places within bounds
    const { data: places, error: placesError } = await supabase
      .from("places")
      .select("*")
      .gte("latitude", south)
      .lte("latitude", north)
      .gte("longitude", west)
      .lte("longitude", east)
      .in("place_type", types)
      .limit(100);

    if (placesError) {
      throw placesError;
    }

    if (!places || places.length === 0) {
      return NextResponse.json({ places: [] });
    }

    // Get latest prices for gas stations
    const gasStationIds = places
      .filter((p) => p.place_type === "gas_station")
      .map((p) => p.id);

    let pricesMap: Record<
      string,
      { regular?: number; high_octane?: number; diesel?: number; kerosene?: number; updated_at?: string }
    > = {};

    if (gasStationIds.length > 0) {
      const { data: prices } = await supabase
        .from("price_posts")
        .select("*")
        .in("place_id", gasStationIds)
        .order("created_at", { ascending: false });

      if (prices) {
        // Group by place and get latest price for each fuel type
        prices.forEach((price) => {
          if (!pricesMap[price.place_id]) {
            pricesMap[price.place_id] = {};
          }
          if (!pricesMap[price.place_id][price.fuel_type as keyof typeof pricesMap[string]]) {
            pricesMap[price.place_id][price.fuel_type as keyof typeof pricesMap[string]] = price.price;
            if (!pricesMap[price.place_id].updated_at || price.created_at > pricesMap[price.place_id].updated_at!) {
              pricesMap[price.place_id].updated_at = price.created_at;
            }
          }
        });
      }
    }

    // Combine places with prices
    const placesWithPrices = places.map((place) => ({
      ...place,
      latest_prices: pricesMap[place.id] || {},
    }));

    return NextResponse.json({ places: placesWithPrices });
  } catch (error) {
    console.error("Error fetching places:", error);
    return NextResponse.json(
      { error: "Failed to fetch places" },
      { status: 500 }
    );
  }
}
