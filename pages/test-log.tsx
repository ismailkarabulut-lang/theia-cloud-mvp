// pages/test-log.tsx
import React, { useState } from 'react';

export default function TestLog() {
  const [status, setStatus] = useState<string>('Hazır');

  async function sendLog() {
    setStatus('Gönderiliyor…');

    try {
      const res = await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: 'focused',
          state_of_mind: 'deep flow',
          content: 'TestLog sayfasından deneme kaydı',
          tags: ['test', 'deploy', 'supabase'],
          audio_url: null,
        }),
      });

      const data = await res.json();
      setStatus(`Sonuç: ${JSON.stringify(data)}`);
    } catch (err: any) {
      setStatus(`Hata: ${err?.message ?? 'bilinmeyen'}`);
    }
  }

  return (
    <main
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#000',
        color: '#f5a623',
        fontFamily: 'monospace',
        gap: '16px',
        flexDirection: 'column',
      }}
    >
      <h1 style={{ fontSize: '1.6rem', margin: 0 }}>Test Log Sayfası</h1>

      <button
        onClick={sendLog}
        style={{
          padding: '10px 16px',
          borderRadius: 8,
          border: '1px solid #f5a623',
          background: 'transparent',
          color: '#f5a623',
          cursor: 'pointer',
        }}
      >
        Log kaydet
      </button>

      <code
        style={{
          maxWidth: 800,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          color: '#b2ffb2',
          textAlign: 'center',
        }}
      >
        {status}
      </code>

      <a
        href="/api/log"
        style={{ color: '#7bdcb5', textDecoration: 'underline' }}
        title="Kayıtları GET ile görüntüle"
      >
        /api/log (GET ile kayıtları görüntüle)
      </a>
    </main>
  );
}
