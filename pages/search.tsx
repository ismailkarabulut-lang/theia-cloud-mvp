// pages/api/search.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Sorgu parametresi: /api/search?q=...
  const q = String(req.query.q ?? '').trim();

  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .ilike('content', `%${q}%`)
    .limit(10);

  if (error) return res.status(500).json({ ok: false, error: error.message });
  return res.status(200).json({ ok: true, results: data ?? [] });
}
