import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Get Monday of current ISO week as YYYY-MM-DD
function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diff = (day === 0 ? -6 : 1 - day);
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toISOString().split("T")[0];
}

// GET /api/missions?user_id=xxx  — fetch or create this week's missions for user
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id");
  if (!userId) return NextResponse.json({ error: "user_id required" }, { status: 400 });

  const weekStart = getWeekStart();

  // Check if user already has missions for this week
  const { data: existing } = await supabase
    .from("user_missions")
    .select("*, mission_templates(*)")
    .eq("user_id", userId)
    .eq("week_start", weekStart);

  if (existing && existing.length > 0) {
    return NextResponse.json({ missions: existing, week_start: weekStart });
  }

  // Assign 4 random missions for the week (1 easy, 1 hard, 2 medium)
  const { data: templates } = await supabase.from("mission_templates").select("*");
  if (!templates) return NextResponse.json({ missions: [], week_start: weekStart });

  const easy   = templates.filter(t => t.difficulty === "easy");
  const medium = templates.filter(t => t.difficulty === "medium");
  const hard   = templates.filter(t => t.difficulty === "hard");

  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const selected = [
    pick(easy),
    pick(medium),
    pick(medium),
    pick(hard),
  ].filter(Boolean);

  const rows = selected.map(t => ({
    user_id: userId,
    mission_id: t.id,
    week_start: weekStart,
  }));

  const { data: inserted } = await supabase
    .from("user_missions")
    .upsert(rows, { onConflict: "user_id,mission_id,week_start" })
    .select("*, mission_templates(*)");

  return NextResponse.json({ missions: inserted ?? [], week_start: weekStart });
}

// POST /api/missions  — update progress for a mission type
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { user_id, mission_type } = body;
  if (!user_id || !mission_type) return NextResponse.json({ error: "user_id and mission_type required" }, { status: 400 });

  const weekStart = getWeekStart();

  // Get active missions of this type for the user this week
  const { data: missions } = await supabase
    .from("user_missions")
    .select("*, mission_templates(*)")
    .eq("user_id", user_id)
    .eq("week_start", weekStart)
    .eq("completed", false);

  if (!missions || missions.length === 0) return NextResponse.json({ updated: [] });

  const relevant = missions.filter((m: any) => m.mission_templates?.type === mission_type);
  if (relevant.length === 0) return NextResponse.json({ updated: [] });

  const rewarded: { mission_id: string; points: number }[] = [];

  for (const m of relevant) {
    const newProgress = m.progress + 1;
    const completed = newProgress >= m.mission_templates.target;

    const { data: updated } = await supabase
      .from("user_missions")
      .update({
        progress: newProgress,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
        rewarded: completed,
      })
      .eq("id", m.id)
      .select()
      .single();

    if (completed) {
      const pts = m.mission_templates.points;
      rewarded.push({ mission_id: m.mission_id, points: pts });

      // Write to point_history
      await supabase.from("point_history").insert({
        user_id,
        delta: pts,
        label: `ミッション完了: ${m.mission_templates.title_ja}`,
        source: "mission",
      });

      // Upsert user_points
      await supabase.rpc("increment_user_points", { p_user_id: user_id, p_delta: pts })
        .catch(() => {
          // Fallback if RPC doesn't exist
          return supabase.from("user_points").upsert(
            { user_id, total_points: pts, updated_at: new Date().toISOString() },
            { onConflict: "user_id" }
          );
        });
    }
  }

  return NextResponse.json({ updated: relevant.length, rewarded });
}
