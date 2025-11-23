import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

// Create a small stub used when env vars are missing so the dev server doesn't crash.
// The stub approximates a Supabase client for the limited methods the app calls.
const stub = {
	auth: {
		getSession: async () => ({ data: { session: null } }),
		signOut: async () => ({ error: null }),
		// match the supabase-js v2 auth API used in the app
		signInWithPassword: async (_: { email: string; password: string }) => ({ data: { session: null }, error: null }),
	},
	from: () => ({
		select: async () => ({ data: null, error: null }),
		insert: async () => ({ data: null, error: null }),
		update: async () => ({ data: null, error: null }),
		delete: async () => ({ data: null, error: null }),
	}),
} as unknown as SupabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
	console.warn('Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY). Using stub supabase client for local dev.');
}

export const supabase: SupabaseClient = (supabaseUrl && supabaseAnonKey)
	? createClient(supabaseUrl, supabaseAnonKey)
	: stub;


