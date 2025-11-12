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

export default function LogsPage() {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <main style={{maxWidth: 900, margin: '40px auto', padding: '0 16px', fontFamily: 'ui-sans-serif, system-ui'}}>
      <h1 style={{fontSize: 28, marginBottom: 12}}>Theia Logs</h1>
      <p style={{opacity: 0.8, marginBottom: 20}}>Son kayıtlar (en yeni → eski)</p>

      {loading ? <div>Yükleniyor…</div> : (
        rows.length === 0 ? <div>Kayıt bulunamadı.</div> : (
          <ul style={{listStyle: 'none', padding: 0}}>
            {rows.map(row => (
              <li key={row.id} style={{border: '1px solid #333', borderRadius: 8, padding: 12, marginBottom: 10}}>
                <div style={{fontSize: 13, opacity: 0.8}}>
                  {new Date(row.created_at).toLocaleString()}
                </div>
                <div style={{fontSize: 16, marginTop: 6}}>
                  {row.content ?? '—'}
                </div>
                <div style={{fontSize: 13, marginTop: 6, opacity: 0.9}}>
                  Mood: {row.mood ?? '—'} · State: {row.state_of_mind ?? '—'}
                </div>
                {row.tags && row.tags.length > 0 && (
                  <div style={{marginTop: 6, fontSize: 12, opacity: 0.9}}>
                    Tags: {row.tags.join(', ')}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )
      )}
    </main>
  );
}
