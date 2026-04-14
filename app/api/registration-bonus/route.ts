import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BONUS_POINTS = 20;

// POST /api/registration-bonus  — claim one-time registration bonus
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { user_id } = body;
  if (!user_id) return NextResponse.json({ error: "user_id required" }, { status: 400 });

  // Check if already claimed
  const { data: existing } = await supabase
    .from("user_registration_bonus")
    .select("user_id")
    .eq("user_id", user_id)
    .single();

  if (existing) {
    return NextResponse.json({ already_claimed: true, points: 0 });
  }

  // Insert bonus record
  const { error } = await supabase.from("user_registration_bonus").insert({
    user_id,
    points_awarded: BONUS_POINTS,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Record in point history
  await supabase.from("point_history").insert({
    user_id,
    delta: BONUS_POINTS,
    label: "新規登録ボーナス",
    source: "registration",
  });

  // Upsert user_points
  const { data: existing_pts } = await supabase
    .from("user_points")
    .select("total_points")
    .eq("user_id", user_id)
    .single();

  if (existing_pts) {
    await supabase
      .from("user_points")
      .update({ total_points: existing_pts.total_points + BONUS_POINTS, updated_at: new Date().toISOString() })
      .eq("user_id", user_id);
  } else {
    await supabase.from("user_points").insert({
      user_id,
      total_points: BONUS_POINTS,
    });
  }

  return NextResponse.json({ already_claimed: false, points: BONUS_POINTS });
}
