// pages/index.tsx (örnek)
import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: 16 }}>
      <h1>Theia Cloud</h1>
      <p>Hızlı not ve log yönetimi</p>
      <nav style={{ marginTop: 12 }}>
        <Link href="/logs">Go to Logs</Link>
      </nav>
    </main>
  );
}
