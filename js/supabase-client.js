import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_CONFIG } from './supabase-config.js';

// Validate Configuration before initializing
const isConfigValid =
    SUPABASE_CONFIG.url &&
    SUPABASE_CONFIG.url.startsWith('http') &&
    SUPABASE_CONFIG.anonKey &&
    !SUPABASE_CONFIG.anonKey.includes('لطفا');

if (!isConfigValid) {
    console.error(
        "❌ خطا: اطلاعات اتصال به سوپابیس (URL یا Anon Key) تنظیم نشده است.\n" +
        "لطفا فایل 'js/supabase-config.js' را ویرایش کرده و اطلاعات پروژه خود را وارد کنید."
    );
}

// Export a placeholder if config is invalid to prevent breaking imports
export const supabase = isConfigValid
    ? createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)
    : {
        auth: {
            getSession: async () => ({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            signInWithOAuth: async () => ({ data: {}, error: null }),
            signOut: async () => ({ error: null })
        },
        from: () => ({
            select: () => ({
                order: () => ({ limit: () => ({ single: async () => ({ data: null, error: null }) }) }),
                eq: () => ({ single: async () => ({ data: null, error: null }) })
            })
        })
    };
