export default function TestLog() {
  async function sendLog() {
    const res = await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mood: 'focused',
        state_of_mind: 'deep flow',
        content: 'Theia Cloud test log successful 🚀',
        tags: ['deploy', 'supabase'],
        audio_url: null
      }),
    });
    const data = await res.json();
    alert(JSON.stringify(data, null, 2));
  }

  return (
    <main style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#000', color: '#fa6' }}>
      <button onClick={sendLog} style={{ padding: '10px 20px', fontSize: '1.2rem' }}>
        Send Test Log
      </button>
    </main>
  );
}
