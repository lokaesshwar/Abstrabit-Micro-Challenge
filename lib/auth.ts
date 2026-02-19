// Server-side auth helper — re-exports the same client for use in Server Components
// Note: for full SSR cookie handling, upgrade to @supabase/ssr later.
export { supabase } from '@/lib/supabaseClient';