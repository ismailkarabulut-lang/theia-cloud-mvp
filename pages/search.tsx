import { supabase } from '@/lib/supabaseServer';

export default async function handler(req, res) {
  const { query } = req.query;

  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .ilike('content', `%${query}%`);

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
}
