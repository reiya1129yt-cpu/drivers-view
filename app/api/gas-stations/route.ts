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
    console.error("[v0] Error fetching gas stations:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If no real data yet, return mock seed data so the map shows something
  if (!data || data.length === 0) {
    const mock = [
      { id: "mock-1", station_name: "コスモ石油 渋谷店", fuel_type: "regular", price: 165, latitude: 35.6580, longitude: 139.7016, comment: "セルフ", reported_at: new Date().toISOString(), created_at: new Date().toISOString() },
      { id: "mock-2", station_name: "出光 新宿西口SS", fuel_type: "high_octane", price: 176, latitude: 35.6896, longitude: 139.6917, comment: null, reported_at: new Date().toISOString(), created_at: new Date().toISOString() },
      { id: "mock-3", station_name: "ENEOS 青山通り店", fuel_type: "diesel", price: 148, latitude: 35.6705, longitude: 139.7158, comment: "24時間営業", reported_at: new Date().toISOString(), created_at: new Date().toISOString() },
      { id: "mock-4", station_name: "Shell 池袋店", fuel_type: "regular", price: 168, latitude: 35.7305, longitude: 139.7107, comment: null, reported_at: new Date().toISOString(), created_at: new Date().toISOString() },
      { id: "mock-5", station_name: "apollostation 品川", fuel_type: "high_octane", price: 179, latitude: 35.6204, longitude: 139.7339, comment: "会員割引あり", reported_at: new Date().toISOString(), created_at: new Date().toISOString() },
    ];
    return NextResponse.json(mock);
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    const body: GasStationInput = await request.json();

    if (!body.station_name?.trim() || !body.fuel_type || !body.price || body.latitude === undefined || body.longitude === undefined) {
      return NextResponse.json({ error: "必須フィールドが不足しています" }, { status: 400 });
    }

    if (!["regular", "high_octane", "diesel", "ev_charging"].includes(body.fuel_type)) {
      return NextResponse.json({ error: "無効な燃料タイプです" }, { status: 400 });
    }

    if (body.price <= 0 || body.price > 999) {
      return NextResponse.json({ error: "価格が無効です" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("gas_stations")
      .insert({
        station_name: body.station_name.trim(),
        fuel_type: body.fuel_type,
        price: body.price,
        latitude: body.latitude,
        longitude: body.longitude,
        comment: body.comment?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error("[v0] Error inserting gas station:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "リクエストが無効です" }, { status: 400 });
  }
}
