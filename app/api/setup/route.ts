import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: "Missing Supabase configuration" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Check if table exists by trying to select from it
    const { error: checkError } = await supabase
      .from("gas_stations")
      .select("id")
      .limit(1);

    if (checkError && checkError.code === "42P01") {
      // Table doesn't exist - but we can't create it via the client
      // The table needs to be created in the Supabase dashboard or via SQL editor
      return NextResponse.json(
        {
          error: "Table does not exist",
          message:
            "Please create the gas_stations table in Supabase dashboard",
          sql: `
CREATE TABLE IF NOT EXISTS gas_stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_name TEXT NOT NULL,
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('regular', 'high_octane', 'diesel')),
  price DECIMAL(10, 2) NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE gas_stations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON gas_stations FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON gas_stations FOR INSERT WITH CHECK (true);
          `,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: "Table exists" });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Setup failed", details: String(error) },
      { status: 500 }
    );
  }
}
