// pages/logs.tsx
import { useEffect, useState } from 'react';
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

export default function LogsPage() {
  // LOG LISTESI
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [content, setContent] = useState('Hızlı test');

  // NPM özet state
  const [patterns, setPatterns] = useState<any>(null);

  // SEARCH
  const [q, setQ] = useState('Theia');
  const [searching, setSearching] = useState(false);
  const [hits, setHits] = useState<VaultHit[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Ilk yuklemede son loglar
  useEffect(() => {
    fetch('/api/logs')
      .then(res => res.json())
      .then(data => {
        setRows(data.results);
        setLoading(false);

        // NPM pattern analizi
        const summary = extractPatterns(data.results || []);
        setPatterns(summary);
      });
  }, []);

  // HIZLI EKLE
  const addQuick = async () => {
    setAdding(true);

    const payload = {
      mood: "ok",
      state_of_mind: "quick add",
      content,
      tags: ["ui", "quick"]
    };

    await fetch('/api/log', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    // yeniden verileri çek
    const res = await fetch('/api/logs');
    const data = await res.json();
    setRows(data.results);

    // pattern güncelle
    const summary = extractPatterns(data.results || []);
    setPatterns(summary);

    setAdding(false);
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
    } catch (e: any) {
      setSearchError("Arama sırasında hata oluştu.");
    }

    setSearching(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Theia Logs</h1>

      {/* HIZLI TEST */}
      <button
        onClick={addQuick}
        disabled={adding}
        style={{ marginBottom: 20 }}
      >
        Hızlı Ekle
      </button>

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
                borderRadius: 8,
              }}
            >
              <p><b>{new Date(log.created_at).toLocaleString()}</b></p>
              <p>{log.content}</p>
              <p>Mood: {log.mood || "—"} · State: {log.state_of_mind || "—"}</p>
              <p>Tags: {log.tags?.join(', ')}</p>
            </div>
          ))}
        </div>
      )}

      {/* NPM ÖZET BLOĞU */}
      {patterns && (
        <div style={{ marginTop: "40px", padding: "20px", background: "#1a1a1a", borderRadius: "8px" }}>
          <h2 style={{ marginBottom: "10px" }}>Theia NPM Özet</h2>

          <p>Toplam log: {patterns.totalLogs}</p>

          <p>
            En aktif saat:{" "}
            {Object.entries(patterns.timePattern).length > 0
              ? Object.entries(patterns.timePattern).sort((a, b) => b[1] - a[1])[0][0]
              : "Veri yok"}
          </p>

          <p>
            En sık mood:{" "}
            {Object.entries(patterns.moodPattern).length > 0
              ? Object.entries(patterns.moodPattern).sort((a, b) => b[1] - a[1])[0][0]
              : "Veri yok"}
          </p>

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
        <button onClick={doSearch} disabled={searching}>Ara</button>

        {searchError && (
          <p style={{ color: "red" }}>{searchError}</p>
        )}

        {hits.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h3>Sonuçlar</h3>
            {hits.map((h) => (
              <div
                key={h.id}
                style={{ marginBottom: 20, padding: 12, background: "#111", borderRadius: 8 }}
              >
                <p><b>{h.file_path}</b></p>
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
