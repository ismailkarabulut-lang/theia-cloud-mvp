import { useState } from 'react';

export default function Home() {
  const [mood, setMood] = useState('');
  const [stateOfMind, setStateOfMind] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setOk(null); setErr(null);
    try {
      const now = new Date();
      const body = {
        entry_date: now.toISOString().slice(0,10),
        time: now.toTimeString().slice(0,5),
        mood,
        state_of_mind: stateOfMind,
        content_md: content,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        audio_url: audioUrl || null
      };
      const res = await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Failed');
      setOk('Kayıt oluşturuldu.');
      setMood(''); setStateOfMind(''); setContent(''); setTags(''); setAudioUrl('');
    } catch (e:any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main style={{maxWidth: 820, margin: '40px auto', padding: 16, lineHeight: 1.5}}>
      <h1>🧠 Theia Consciousness Log</h1>
      <p>Günlük bilinci buradan kaydet. <a href="/search">Arama</a></p>

      <form onSubmit={onSubmit} style={{display:'grid', gap:12}}>
        <label> Mood
          <input value={mood} onChange={e=>setMood(e.target.value)} placeholder="derinleşme" />
        </label>
        <label> State of Mind
          <input value={stateOfMind} onChange={e=>setStateOfMind(e.target.value)} placeholder="yaratıcı, sezgisel" />
        </label>
        <label> Content (Markdown)
          <textarea value={content} onChange={e=>setContent(e.target.value)} rows={12}
            placeholder="# 🧠 Theia Consciousness Log ..."></textarea>
        </label>
        <label> Tags (virgülle)
          <input value={tags} onChange={e=>setTags(e.target.value)} placeholder="theia-consciousness, identity-seed" />
        </label>
        <label> Audio URL (opsiyonel)
          <input value={audioUrl} onChange={e=>setAudioUrl(e.target.value)} placeholder="https://..." />
        </label>
        <button disabled={saving || !content}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</button>
      </form>

      {ok && <p style={{color:'green'}}>{ok}</p>}
      {err && <p style={{color:'tomato'}}>{err}</p>}
    </main>
  );
}
