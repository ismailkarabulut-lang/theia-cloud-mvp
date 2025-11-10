import { supabase } from '@/lib/supabaseServer';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { mood, stateOfMind, content, tags, audioUrl } = req.body;

    const { data, error } = await supabase
      .from('entries')
      .insert([{ mood, state_of_mind: stateOfMind, content, tags, audio_url: audioUrl }]);

    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json({ success: true, data });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
