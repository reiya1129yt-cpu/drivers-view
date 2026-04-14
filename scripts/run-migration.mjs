import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log("Running database migration...");

  // Read SQL file
  const sql = readFileSync("./scripts/001_create_gas_stations.sql", "utf8");

  // Execute the SQL
  const { error } = await supabase.rpc("exec_sql", { sql_query: sql });

  if (error) {
    // Try running individual statements
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      const { error: stmtError } = await supabase.rpc("exec_sql", {
        sql_query: statement,
      });
      if (stmtError) {
        console.log(`Statement skipped (may already exist): ${statement.substring(0, 50)}...`);
      }
    }
  }

  console.log("Migration completed!");
}

runMigration().catch(console.error);
