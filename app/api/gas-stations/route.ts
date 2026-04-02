import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import type { GasStationInput } from "@/lib/types";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("gas_stations")
    .select("*")
    .order("price", { ascending: true });

  if (error) {
    console.error("Error fetching gas stations:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    const body: GasStationInput = await request.json();

    // Validate required fields
    if (
      !body.station_name ||
      !body.fuel_type ||
      !body.price ||
      body.latitude === undefined ||
      body.longitude === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate fuel type
    if (!["regular", "high_octane", "diesel"].includes(body.fuel_type)) {
      return NextResponse.json({ error: "Invalid fuel type" }, { status: 400 });
    }

    // Validate price
    if (body.price <= 0) {
      return NextResponse.json(
        { error: "Price must be positive" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("gas_stations")
      .insert({
        station_name: body.station_name,
        fuel_type: body.fuel_type,
        price: body.price,
        latitude: body.latitude,
        longitude: body.longitude,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating gas station:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
