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
const mockQuery = {
    select: () => mockQuery,
    eq: () => mockQuery,
    order: () => mockQuery,
    limit: () => mockQuery,
    range: () => mockQuery,
    single: () => mockQuery,
    // Add then/catch/finally to make it thenable (awaitable)
    then: (onFullfilled) => onFullfilled({ data: [], error: null }),
    catch: (onRejected) => onRejected(new Error("Supabase not configured")),
    finally: (onFinally) => onFinally()
};

export const supabase = isConfigValid
    ? createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)
    : {
        auth: {
            getSession: async () => ({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            signInWithOAuth: async () => {
                const msg = "❌ خطا: اطلاعات Supabase تنظیم نشده است. لطفا فایل js/supabase-config.js را ویرایش کنید.";
                alert(msg);
                return { data: {}, error: { message: msg } };
            },
            signOut: async () => ({ error: null })
        },
        from: () => mockQuery,
        isMock: true
    };

// Dedicated Public Client for Guest Access (No session persistence)
// storageKey is added to avoid "Multiple GoTrueClient instances" warning
export const publicSupabase = isConfigValid
    ? createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
            storageKey: 'dellcake-public-session'
        }
    })
    : supabase;
