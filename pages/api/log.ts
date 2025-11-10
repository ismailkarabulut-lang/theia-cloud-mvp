// pages/api/log.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseServer';

type LogBody = {
  mood?: string;
  stateOfMind?: string;
  content?: string;
  tags?: string[];
  audioUrl?: string;
};

type LogRow = {
  mood?: string;
  state_of_mind?: string;
  content?: string;
  tags?: string[];
  audio_url?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Sadece POST kabul ediyoruz
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Body’yi güvenli al
  const { mood, stateOfMind, content, tags, audioUrl } = (req.body ?? {}) as LogBody;

  // Supabase satırı (snake_case alanlar tabloya uygun)
  const row: LogRow = {
    mood,
    state_of_mind: stateOfMind,
    content,
    tags,
    audio_url: audioUrl,
  };

  // Ekle ve dönen kaydı tekil çek
  const { data, error } = await supabase.from('logs').insert([row]).select().single();

  if (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }

  return res.status(200).json({ ok: true, data });
}
