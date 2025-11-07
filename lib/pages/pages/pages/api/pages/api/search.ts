import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { supabaseServer } from '../../lib/supabaseServer';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const q = (req.query.q as string) || '';
  if (!q) return res.status(400).json({ error: 'q required' });

  try {
    // 0) güvenlik: server key var mı?
    if (!process.env.SUPABASE_SERVICE_ROLE) throw new Error('Server key missing');

    // 1) sorgu embedding’i
    const emb = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: q
    });
    const queryVec = emb.data[0].embedding as unknown as number[];

    // 2) Postgres function üzerinden semantik arama
    //   match_entries(query_embedding vector(1536), match_count int) RETURNS TABLE(...)
    const { data, error } = await supabaseServer.rpc('match_entries', {
      query_embedding: queryVec,
      match_count: 10
    });
    if (error) throw error;

    res.status(200).json({ results: data || [] });
  } catch (e:any) {
    res.status(500).json({ error: e.message || 'search error' });
  }
}
