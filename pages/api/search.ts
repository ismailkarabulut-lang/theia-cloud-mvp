import { useState } from 'react';

export default function Search() {
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true); setErr(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Search failed');
      setRows(j.rows);
    } catch (e:any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{maxWidth: 820, margin: '40px auto', padding: 16}}>
      <h1>🔍 Arama</h1>
      <p><a href="/">← Yeni kayıt ekle</a></p>

      <form onSubmit={onSearch} style={{display:'flex', gap:12, marginBottom:20}}>
        <input
          value={q}
          onChange={e=>setQ(e.target.value)}
          placeholder="kelime, duygu, konu…"
          style={{flex:1}}
        />
        <button disabled={!q || loading}>{loading ? 'Aranıyor…' : 'Ara'}</button>
      </form>

      {err && <p style={{color:'red'}}>{err}</p>}

      {rows && rows.length === 0 && <p>Sonuç bulunamadı.</p>}

      {rows && rows.length > 0 && (
        <ul style={{display:'grid', gap:20, padding:0}}>
          {rows.map(r => (
            <li key={r.id} style={{border:'1px solid #ddd', padding:12, borderRadius:8}}>
              <b>{r.entry_date} – {r.time}</b><br/>
              <i>{r.mood} / {r.state_of_mind}</i>
              <pre style={{whiteSpace:'pre-wrap', marginTop:8}}>{r.content_md}</pre>
              {r.tags?.length > 0 && (
                <p style={{opacity:0.7}}>🏷 {r.tags.join(', ')}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
