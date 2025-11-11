// pages/api/search.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const q = (req.query.q as string) || '';
  try {
    const { data, error } = await supabaseAdmin.rpc('search_vault_hybrid', {
      query_embedding: null,   // embedding henüz yok
      query_text: q,
      match_count: 10,
    });
    if (error) return res.status(500).json({ ok: false, error: error.message });
    return res.status(200).json({ ok: true, results: data ?? [] });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message });
  }
}
