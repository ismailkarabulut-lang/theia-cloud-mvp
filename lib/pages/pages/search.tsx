import { useState } from 'react';

type Hit = { id: string; entry_date: string; content_md: string; similarity: number };

export default function Search() {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const run = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/search?q=' + encodeURIComponent(q));
      const j = await r.json();
      setHits(j.results || []);
    } finally { setLoading(false); }
  };

  return (
    <main style={{maxWidth: 820, margin: '40px auto', padding: 16}}>
      <h1>🔎 Arama</h1>
      <p><a href="/">← Kayıt oluştur</a></p>
      <div style={{display:'flex', gap:8}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="yumurta teorisi, theia..." style={{flex:1}}/>
        <button onClick={run} disabled={loading || !q}>{loading ? 'Aranıyor...' : 'Ara'}</button>
      </div>

      <ul style={{marginTop: 20, display:'grid', gap:12}}>
        {hits.map(h => (
          <li key={h.id} style={{padding:12, border:'1px solid #333', borderRadius:8}}>
            <div style={{opacity:0.7, fontSize:12}}>{h.entry_date} • benzerlik {(h.similarity*100).toFixed(1)}%</div>
            <pre style={{whiteSpace:'pre-wrap'}}>{(h.content_md || '').slice(0, 500)}{(h.content_md || '').length>500?'…':''}</pre>
          </li>
        ))}
      </ul>
    </main>
  );
}
