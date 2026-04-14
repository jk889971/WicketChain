// ============================================================
// WicketChain Indexer — Supabase Client (service_role)
// Bypasses RLS for backend writes
// ============================================================

import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from "./config.js";

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});
