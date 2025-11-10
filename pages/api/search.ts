import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const q = String(req.query.q ?? '');
  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .ilike('content', `%${q}%`)
    .limit(10);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ results: data });
}
