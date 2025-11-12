// pages/logs.tsx
import { useEffect, useState } from 'react';

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

  // SEARCH
  const [q, setQ] = useState('Theia');
  const [searching, setSearching] = useState(false);
  const [hits, setHits] = useState<VaultHit[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // İlk yüklemede son loglar
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/log');
        const j = await r.json();
        setRows((j?.results ?? []).slice(0, 50));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Tek tuşla POST
  async function addQuickLog() {
    try {
      if (!content.trim()) return;
      setAdding(true);
      const r = await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: 'ok',
          state_of_mind: 'quick add',
          content,
          tags: ['ui', 'quick'],
          audio_url: null,
        }),
      });
      const j = await r.json();
      if (j?.ok && j?.data) {
        setRows(prev => [j.data, ...prev].slice(0, 50));   // en üste ekle
        setContent('Hızlı test');
      } else {
        alert('Kayıt eklenemedi: ' + (j?.error ?? 'unknown'));
      }
    } finally {
      setAdding(false);
    }
  }

  // /api/search
  async function runSearch() {
    try {
      setSearching(true);
      setSearchError(null);
      const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const j = await r.json();
      if (j?.ok) {
        setHits(j?.results ?? []);
      } else {
        setHits([]);
        setSearchError(j?.error ?? 'search_failed');
      }
    } catch (e: any) {
      setHits([]);
      setSearchError(e?.message ?? 'search_failed');
    } finally {
      setSearching(false);
    }
  }

  const box = { border: '1px solid #333', borderRadius: 8, padding: 12 };

  return (
    <main style={{ maxWidth: 900, margin: '40px auto', padding: '0 16px', fontFamily: 'ui-sans-serif, system-ui' }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>Theia Logs</h1>
      <p style={{ opacity: 0.8, marginBottom: 20 }}>Son kayıtlar (en yeni → eski)</p>

      {/* Hızlı ekleme formu */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Kısa not..."
          style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #333', background: '#111', color: '#eee' }}
        />
        <button
          onClick={addQuickLog}
          disabled={adding || !content.trim()}
          style={{
            padding: '8px 14px',
            borderRadius: 6,
            border: '1px solid #333',
            background: adding ? '#333' : '#1a1a1a',
            color: '#eee',
            cursor: adding ? 'not-allowed' : 'pointer',
          }}
        >
          {adding ? 'Ekleniyor…' : 'Hızlı Ekle'}
        </button>
      </div>

      {/* SEARCH BLOK */}
      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, marginBottom: 10 }}>Vault Search</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Arama terimi (ör. Theia)"
            style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #333', background: '#111', color: '#eee' }}
          />
          <button
            onClick={runSearch}
            disabled={searching || !q.trim()}
            style={{
              padding: '8px 14px',
              borderRadius: 6,
              border: '1px solid #333',
              background: searching ? '#333' : '#1a1a1a',
              color: '#eee',
              cursor: searching ? 'not-allowed' : 'pointer',
            }}
          >
            {searching ? 'Aranıyor…' : 'Ara'}
          </button>
        </div>

        {searchError && <div style={{ color: '#ff7a7a', marginBottom: 10 }}>Hata: {searchError}</div>}

        {hits.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {hits.map(h => (
              <li key={h.id} style={{ ...box, marginBottom: 10 }}>
                <div style={{ fontSize: 14, opacity: 0.9 }}>{h.file_path}</div>
                <div style={{ fontSize: 16, marginTop: 4 }}>{h.title ?? '—'}</div>
                {typeof h.similarity === 'number' && (
                  <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                    similarity: {h.similarity.toFixed(3)}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {hits.length === 0 && !searching && (
          <div style={{ opacity: 0.8 }}>Sonuç yok.</div>
        )}
      </section>

      {/* LOG LISTESI */}
      {loading ? (
        <div>Yükleniyor…</div>
      ) : rows.length === 0 ? (
        <div>Kayıt bulunamadı.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {rows.map((row) => (
            <li key={row.id} style={{ ...box, marginBottom: 10 }}>
              <div style={{ fontSize: 13, opacity: 0.8 }}>
                {new Date(row.created_at).toLocaleString()}
              </div>
              <div style={{ fontSize: 16, marginTop: 6 }}>
                {row.content ?? '—'}
              </div>
              <div style={{ fontSize: 13, marginTop: 6, opacity: 0.9 }}>
                Mood: {row.mood ?? '—'} · State: {row.state_of_mind ?? '—'}
              </div>
              {row.tags && row.tags.length > 0 && (
                <div style={{ marginTop: 6, fontSize: 12, opacity: 0.9 }}>
                  Tags: {row.tags.join(', ')}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
