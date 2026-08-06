import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy singleton — only instantiated when first called at runtime,
// NOT at module-eval time. This prevents build-time prerender errors.
let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('supabaseUrl is required.');
    }
    _client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _client;
}

// Proxy object — behaves exactly like the supabase client, but
// defers instantiation until first property access.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getClient() as any)[prop];
  },
});
