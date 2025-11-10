import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseServer';

type LogBody = {
  mood?: string;
  stateOfMind?: string;
  content?: string;
  tags?: string[];
  audioUrl?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { mood, stateOfMind, content, tags, audioUrl } = (req.body ?? {}) as LogBody;

  const { data, error } = await supabase
    .from('logs')
    .insert([
      {
        mood,
        state_of_mind: stateOfMind,
        content,
        tags,
        audio_url: audioUrl,
      },
    ])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ ok: true, data });
}
