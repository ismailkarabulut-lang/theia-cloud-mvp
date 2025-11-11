// pages/logs.tsx
import { useEffect, useMemo, useState } from "react";

type LogRow = {
  id: string;
  created_at: string;
  mood: string | null;
  state_of_mind: string | null;
  content: string | null;
  tags: string[] | null;
  audio_url: string | null;
};

export default function LogsPage() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [auto, setAuto] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      // Basit GET — istersen ?q= ile server-side filtrelemeyi de ekleriz
      const res = await fetch("/api/log");
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error || "Fetch failed");
      const arr: LogRow[] = (json.results ?? []).sort(
        (a: LogRow, b: LogRow) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setLogs(arr);
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [auto]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return logs;
    return logs.filter((r) => {
      const hay = [
        r.mood ?? "",
        r.state_of_mind ?? "",
        r.content ?? "",
        ...(r.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [logs, q]);

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#000",
        color: "#f5a623",
        fontFamily: "monospace",
        padding: "32px",
      }}
    >
      <h1 style={{ textAlign: "center", fontSize: "1.8rem", marginBottom: 16 }}>
        Theia Logs Viewer
      </h1>

      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ara: mood, state_of_mind, content, tag…"
          style={{
            background: "#111",
            color: "#f5a623",
            border: "1px solid #333",
            padding: "10px 12px",
            borderRadius: 8,
            minWidth: 280,
          }}
        />
        <button
          onClick={load}
          disabled={loading}
          style={{
            background: "#111",
            color: "#f5a623",
            border: "1px solid #333",
            padding: "10px 14px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          {loading ? "Yükleniyor…" : "Yenile"}
        </button>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={auto}
            onChange={(e) => setAuto(e.target.checked)}
          />
          Otomatik yenile (10sn)
        </label>
        <span style={{ opacity: 0.8 }}>
          Toplam: {filtered.length} / {logs.length}
        </span>
      </div>

      {error && (
        <div
          style={{
            color: "#ff6b6b",
            textAlign: "center",
            marginBottom: 12,
            whiteSpace: "pre-wrap",
          }}
        >
          Hata: {error}
        </div>
      )}

      <div
        style={{
          overflowX: "auto",
          border: "1px solid #222",
          borderRadius: 12,
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.95rem",
          }}
        >
          <thead>
            <tr style={{ background: "#0d0d0d" }}>
              {["Zaman", "Mood", "State", "İçerik", "Tags"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    borderBottom: "1px solid #222",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} style={{ background: "#080808" }}>
                <td
                  style={{
                    padding: "10px 12px",
                    borderBottom: "1px solid #111",
                    color: "#ccc",
                  }}
                  title={r.created_at}
                >
                  {new Date(r.created_at).toLocaleString()}
                </td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #111" }}>
                  <Badge>{r.mood || "-"}</Badge>
                </td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #111" }}>
                  <Badge>{r.state_of_mind || "-"}</Badge>
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    borderBottom: "1px solid #111",
                    color: "#ddd",
                    maxWidth: 600,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {r.content || "-"}
                </td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #111" }}>
                  {(r.tags ?? []).length ? (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {r.tags!.map((t) => (
                        <Badge key={t}>#{t}</Badge>
                      ))}
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}

            {!loading && filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: 16,
                    textAlign: "center",
                    color: "#888",
                  }}
                >
                  Kayıt bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p style={{ textAlign: "center", marginTop: 16, color: "#888" }}>
        Theia Cloud MVP • Logs Viewer
      </p>
    </main>
  );
}

function Badge({ children }: { children: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        background: "#111",
        border: "1px solid #333",
        borderRadius: 999,
        padding: "4px 8px",
        color: "#f5a623",
        fontSize: "0.85rem",
      }}
    >
      {children}
    </span>
  );
}
