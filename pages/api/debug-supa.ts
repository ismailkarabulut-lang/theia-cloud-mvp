// pages/api/debug-supa.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 1) Basit tablo okuma
    const { data: notes, error: errNotes } = await supabaseAdmin
      .from('vault_notes')
      .select('id, file_path, title')
      .limit(3);

    // 2) RPC çağrısı
    const q = 'Theia';
    const { data: rpc, error: errRpc } = await supabaseAdmin.rpc('search_vault_hybrid', {
      query_embedding: null,
      query_text: q,
      match_count: 10,
    });

    return res.status(200).json({
      ok: true,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      notes_count: notes?.length ?? 0,
      first_note: notes?.[0] ?? null,
      rpc_count: rpc?.length ?? 0,
      first_rpc: rpc?.[0] ?? null,
      errors: {
        notes: errNotes?.message ?? null,
        rpc: errRpc?.message ?? null,
      },
    });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message });
  }
}
