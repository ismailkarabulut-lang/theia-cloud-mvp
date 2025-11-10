// pages/api/log.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) return res.status(500).json({ ok: false, error: error.message });
    return res.status(200).json({ ok: true, results: data ?? [] });
  }

  if (req.method === 'POST') {
    const { mood, state_of_mind, content, tags, audio_url } = req.body;
    if (!content) return res.status(400).json({ ok: false, error: 'content is required' });

    const { data, error } = await supabase
      .from('logs')
      .insert([{ mood, state_of_mind, content, tags, audio_url }])
      .select()
      .single();

    if (error) return res.status(500).json({ ok: false, error: error.message });
    return res.status(200).json({ ok: true, saved: true, data });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method Not Allowed' });
}
