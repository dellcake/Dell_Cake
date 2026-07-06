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
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            getSession: async () => ({ data: { session: null } }),
            signInWithOAuth: async () => ({ error: { message: "پیکربندی سوپابیس ناقص است" } }),
            signInWithPassword: async () => ({ error: { message: "پیکربندی سوپابیس ناقص است" } }),
            signOut: async () => ({ error: null })
        },
        from: () => ({
            select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) })
        })
    };
