/**
 * Resolve Supabase env vars across Vite, Next-style, and Netlify naming.
 */
export function resolveSupabaseEnv(source = process.env) {
  const supabaseUrl =
    source.VITE_SUPABASE_URL ||
    source.NEXT_PUBLIC_SUPABASE_URL ||
    source.SUPABASE_URL ||
    ''

  const serviceKey =
    source.SUPABASE_SERVICE_ROLE_KEY ||
    source.SERVICE_ROLE_KEY ||
    ''

  return { supabaseUrl, serviceKey }
}

export function resolveSupabaseClientEnv(meta = import.meta.env) {
  const supabaseUrl =
    meta.VITE_SUPABASE_URL ||
    meta.NEXT_PUBLIC_SUPABASE_URL ||
    meta.SUPABASE_URL ||
    ''

  const supabaseAnonKey =
    meta.VITE_SUPABASE_ANON_KEY ||
    meta.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''

  return { supabaseUrl, supabaseAnonKey }
}
