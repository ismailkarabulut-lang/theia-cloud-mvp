// scripts/backup.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ENV (local için .env, CI için repo secrets)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in env.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, { auth: { persistSession: false } });

// küçük yardımcılar
const toCSV = (rows) => {
  if (!rows || rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v) =>
    v === null || v === undefined
      ? ""
      : typeof v === "object"
      ? JSON.stringify(v).replaceAll('"', '""')
      : String(v).replaceAll('"', '""');
  const lines = [
    headers.join(","), // header
    ...rows.map((r) => headers.map((h) => `"${escape(r[h])}"`).join(",")),
  ];
  return lines.join("\n");
};

const main = async () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const folder = path.join(__dirname, "..", "backups", `${yyyy}-${mm}-${dd}`);

  fs.mkdirSync(folder, { recursive: true });

  // 1) vault_notes
  const { data: notes, error: errNotes } = await supabase
    .from("vault_notes")
    .select("*")
    .order("created_at", { ascending: false });
  if (errNotes) throw new Error(`vault_notes error: ${errNotes.message}`);

  fs.writeFileSync(path.join(folder, "vault_notes.json"), JSON.stringify(notes ?? [], null, 2), "utf8");
  fs.writeFileSync(path.join(folder, "vault_notes.csv"), toCSV(notes ?? []), "utf8");

  // 2) logs
  const { data: logs, error: errLogs } = await supabase
    .from("logs")
    .select("*")
    .order("created_at", { ascending: false });
  if (errLogs) throw new Error(`logs error: ${errLogs.message}`);

  fs.writeFileSync(path.join(folder, "logs.json"), JSON.stringify(logs ?? [], null, 2), "utf8");
  fs.writeFileSync(path.join(folder, "logs.csv"), toCSV(logs ?? []), "utf8");

  // kısa özet
  console.log(
    JSON.stringify(
      {
        ok: true,
        folder: `backups/${yyyy}-${mm}-${dd}`,
        counts: { vault_notes: notes?.length ?? 0, logs: logs?.length ?? 0 },
      },
      null,
      2
    )
  );
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
