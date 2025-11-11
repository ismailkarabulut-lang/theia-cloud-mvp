// lib/supabaseServer.ts
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,            // URL
  process.env.SUPABASE_SERVICE_ROLE!,               // SERVICE ROLE (server-only)
  { auth: { persistSession: false } }
);
