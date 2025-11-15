// pages/logs.tsx
import { useEffect, useState } from "react";
import { extractPatterns } from "../lib/patterns";

type LogRow = {
  id: string;
  created_at: string;
  mood?: string | null;
  state_of_mind?: string | null;
  content?: string | null;
  tags?: string[] | null;
  audio_url?: string | null;
};

type VaultHit = {
  id: string;
  file_path: string;
  title: string | null;
  similarity: number | null;
};

type PatternSummary = {
  timePattern: Record<string, number>;
  moodPattern: Record<string, number>;
  quickAddCount: number;
  totalLogs: number;
};

export default function LogsPage() {
  // LOG LİSTESİ
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [content, setContent] = useState("Hızlı test");

  // NPM özet state
  const [patterns, setPatterns] = useState<PatternSummary | null>(null);

  // SEARCH
  const [q, setQ] = useState("Theia");
  const [searching, setSearching] = useState(false);
  const [hits, setHits] = useState<VaultHit[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // İlk yüklemede son loglar
  useEffect(() => {
    const loadLogs = async () => {
      try {
        const res = await fetch("/api/logs");
        const data = await res.json();

        setRows(data.results || []);

        // ✅ DEĞİŞİKLİK: undefined → null dönüşümü
        const summary = extractPatterns(
          (data.results || []).map((row: LogRow) => ({
            id: row.id,
            timestamp: row.created_at,
            mood: row.mood ?? null,
            notes: row.content ?? null,
            tags: row.tags ?? []
          }))
        ) as PatternSummary;
        setPatterns(summary);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  // HIZLI EKLE
  const addQuick = async () => {
    setAdding(true);

    const payload = {
      mood: "ok",
      state_of_mind: "quick add",
      content,
      tags: ["ui", "quick"],
    };

    try {
      await fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const res = await fetch("/api/logs");
      const data = await res.json();
      setRows(data.results || []);

      // ✅ DEĞİŞİKLİK: undefined → null dönüşümü
      const summary = extractPatterns(
        (data.results || []).map((row: LogRow) => ({
          id: row.id,
          timestamp: row.created_at,
          mood: row.mood ?? null,
          notes: row.content ?? null,
          tags: row.tags ?? []
        }))
      ) as PatternSummary;
      setPatterns(summary);
    } finally {
      setAdding(false);
    }
  };

  // SEARCH
  const doSearch = async () => {
    if (!q) return;

    setSearching(true);
    setSearchError(null);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setHits(data.results || []);
    } catch (err) {
      setSearchError("Arama sırasında hata oluştu.");
    } finally {
      setSearching(false);
    }
  };

  // pattern'den en yüksek frekanslı key'i bul
  const getTopKey = (pattern: Record<string, number>): string | null => {
    const entries = Object.entries(pattern);
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  };

  const mostActiveHour =
    patterns && patterns.timePattern ? getTopKey(patterns.timePattern) : null;

  const mostCommonMood =
    patterns && patterns.moodPattern ? getTopKey(patterns.moodPattern) : null;

  return (
    <div style={{ padding: 20 }}>
      <h1>Theia Logs</h1>

      {/* HIZLI TEST */}
      <div style={{ marginBottom: 20, display: "flex", gap: 8 }}>
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ flex: 1, padding: 8 }}
          placeholder="Hızlı not..."
        />
        <button onClick={addQuick} disabled={adding}>
          Hızlı Ekle
        </button>
      </div>

      {/* LOGGER */}
      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <div>
          <h2>Son kayıtlar (en yeni → eski)</h2>
          {rows.map((log) => (
            <div
              key={log.id}
              style={{
                marginBottom: 20,
                padding: 12,
                background: "#111",
                color: "#fff",
                borderRadius: 8,
              }}
            >
              <p>
                <b>{new Date(log.created_at).toLocaleString()}</b>
              </p>
              <p>{log.content}</p>
              <p>
                Mood: {log.mood || "—"} · State: {log.state_of_mind || "—"}
              </p>
              <p>Tags: {log.tags?.join(", ")}</p>
            </div>
          ))}
        </div>
      )}

      {/* NPM ÖZET BLOĞU */}
      {patterns && (
        <div
          style={{
            marginTop: 40,
            padding: 20,
            background: "#1a1a1a",
            color: "#fff",
            borderRadius: 8,
          }}
        >
          <h2 style={{ marginBottom: 10 }}>Theia NPM Özet</h2>

          <p>Toplam log: {patterns.totalLogs}</p>
          <p>En aktif saat: {mostActiveHour ?? "Veri yok"}</p>
          <p>En sık mood: {mostCommonMood ?? "Veri yok"}</p>
          <p>Quick-add davranışı: {patterns.quickAddCount} kez</p>
        </div>
      )}

      {/* SEARCH Bölümü */}
      <div style={{ marginTop: 40 }}>
        <h2>Vault Search</h2>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ara..."
          style={{ width: "60%", padding: 8, marginRight: 10 }}
        />
        <button onClick={doSearch} disabled={searching}>
          Ara
        </button>

        {searchError && <p style={{ color: "red" }}>{searchError}</p>}

        {hits.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h3>Sonuçlar</h3>
            {hits.map((h) => (
              <div
                key={h.id}
                style={{
                  marginBottom: 20,
                  padding: 12,
                  background: "#111",
                  color: "#fff",
                  borderRadius: 8,
                }}
              >
                <p>
                  <b>{h.file_path}</b>
                </p>
                <p>{h.title}</p>
                <p>Benzerlik: {h.similarity}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}