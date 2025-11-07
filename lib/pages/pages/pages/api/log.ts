import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { supabaseServer } from '../../lib/supabaseServer';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { entry_date, time, mood, state_of_mind, content_md, tags, audio_url } = req.body;

    if (!content_md || !entry_date) return res.status(400).json({ error: 'entry_date & content_md required' });

    // 1) entries tablosuna yaz
    const { data: insertRow, error: insertErr } = await supabaseServer
      .from('entries')
      .insert([{ entry_date, time, mood, state_of_mind, content_md, tags, audio_url }])
      .select()
      .single();
    if (insertErr) throw insertErr;

    // 2) embedding üret
    const emb = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: content_md
    });
    const vector = emb.data[0].embedding;

    // 3) entry_embeddings tablosuna yaz
    const { error: embErr } = await supabaseServer
      .from('entry_embeddings')
      .insert([{ entry_id: insertRow.id, embedding: vector as unknown as number[] }]);
    if (embErr) throw embErr;

    res.status(200).json({ ok: true, id: insertRow.id });
  } catch (e:any) {
    res.status(500).json({ error: e.message || 'server error' });
  }
}
