// pages/api/log.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabaseServer';

type LogRow = {
  id: string;
  created_at: string;
  mood: string | null;
  state_of_mind: string | null;
  content: string | null;
  tags: string[] | null;
  audio_url: string | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { mood, state_of_mind, content, tags, audio_url } = req.body ?? {};
      const { data, error } = await supabaseAdmin
        .from<LogRow>('logs')
        .insert([{ mood, state_of_mind, content, tags, audio_url }])
        .select('*')
        .single();

      if (error) return res.status(400).json({ ok: false, error: error.message });
      return res.status(200).json({ ok: true, saved: true, data });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: e?.message ?? 'unknown_error' });
    }
  }

  if (req.method === 'GET') {
    try {
      // Query params: ?q=...&tags=a,b&from=2025-11-01&to=2025-11-11&limit=20&offset=0
      const {
        q,
        tags,
        from,
        to,
        limit = '20',
        offset = '0',
      } = req.query as Record<string, string | undefined>;

      let query = supabaseAdmin.from<LogRow>('logs').select('*', { count: 'exact' });

      // Tam metin yerine pratik LIKE filtresi (kolay ve RLS-dostu):
      if (q && q.trim()) {
        query = query.ilike('content', `%${q.trim()}%`);
      }

      // Tag kesişimi: en az bir eşleşen tag
      if (tags && tags.trim()) {
        const tagArr = tags.split(',').map((t) => t.trim()).filter(Boolean);
        if (tagArr.length > 0) {
          query = query.overlaps('tags', tagArr); // Postgres text[] ile çalışır
        }
      }

      // Tarih aralığı
      if (from) query = query.gte('created_at', new Date(from).toISOString());
      if (to)   query = query.lte('created_at', new Date(to).toISOString());

      // Sıralama ve sayfalama
      const lim = Math.min(parseInt(limit || '20', 10), 100);
      const off = parseInt(offset || '0', 10);
      query = query.order('created_at', { ascending: false }).range(off, off + lim - 1);

      const { data, error, count } = await query;
      if (error) return res.status(400).json({ ok: false, error: error.message });

      return res.status(200).json({
        ok: true,
        results: data ?? [],
        count: count ?? 0,
        limit: lim,
        offset: off,
      });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: e?.message ?? 'unknown_error' });
    }
  }

  res.setHeader('Allow', 'GET,POST');
  return res.status(405).json({ ok: false, error: 'method_not_allowed' });
}
