// pages/api/log.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabaseServer';

type LogInsert = {
  mood?: string;
  state_of_mind?: string;
  content?: string;
  tags?: string[];
  audio_url?: string | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) return res.status(500).json({ ok: false, error: error.message });
      return res.status(200).json({ ok: true, results: data ?? [] });
    }

    if (req.method === 'POST') {
      const { mood, state_of_mind, content, tags, audio_url } = (req.body ?? {}) as LogInsert;

      const { data, error } = await supabaseAdmin
        .from('logs')
        .insert([{ mood, state_of_mind, content, tags, audio_url }])
        .select('*')
        .single();

      if (error) return res.status(500).json({ ok: false, error: error.message });
      return res.status(200).json({ ok: true, saved: true, data });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message });
  }
}
