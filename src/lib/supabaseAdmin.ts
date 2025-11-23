import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;

// If required env vars are present, create a real admin client.
// Otherwise export a stub that returns informative errors so API routes
// can handle the missing configuration without crashing the server at module load.
let supabaseAdmin: SupabaseClient;

if (supabaseUrl && serviceRoleKey) {
    supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
} else {
    console.warn('Missing Supabase admin env vars (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY). Exporting stub admin client.');

    // Minimal stub matching the methods used by the app's API routes.
    const err = { message: 'Supabase admin not configured (SUPABASE_SERVICE_ROLE_KEY missing)' };
    const stub: any = {
        auth: {
            admin: {
                createUser: async (_: any) => ({ data: { user: null }, error: err })
            },
            signInWithPassword: async (_: any) => ({ data: { session: null }, error: err })
        },
        from: () => ({
            select: async () => ({ data: null, error: err }),
            // chain helpers for .eq().single()
            eq: () => ({ single: async () => ({ data: null, error: err }) }),
        }),
    } as SupabaseClient;

    supabaseAdmin = stub;
}

export { supabaseAdmin };