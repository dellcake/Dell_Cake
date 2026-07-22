import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_CONFIG } from './supabase-config.js';

const isConfigured =
    SUPABASE_CONFIG.url &&
    !SUPABASE_CONFIG.url.includes("your-project-id") &&
    SUPABASE_CONFIG.anonKey &&
    !SUPABASE_CONFIG.anonKey.includes("your-anon-key");

if (!isConfigured) {
    console.warn(
        "⚠️ هشدار دل‌کیک: تنظیمات اتصال به سوپابیس (Supabase) انجام نشده است.\n" +
        "لطفاً فایل 'js/supabase-config.js' را با مشخصات پروژه خود ویرایش کنید."
    );
}

// Graceful Mock for offline/unconfigured environments
const mockQuery = {
    insert: () => Promise.resolve({ data: [{ id: "mock-id-" + Date.now() }], error: null }),
    select: () => mockQuery,
    eq: () => mockQuery,
    order: () => mockQuery,
    limit: () => mockQuery,
    single: () => Promise.resolve({ data: null, error: null }),
    then: (resolve) => resolve({ data: [], error: null })
};

export const supabase = isConfigured
    ? createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)
    : {
        from: () => mockQuery,
        channel: () => ({
            on: () => ({
                subscribe: () => ({ unsubscribe: () => {} })
            })
        }),
        isMock: true
    };
