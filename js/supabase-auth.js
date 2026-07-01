import { supabase } from './supabase-client.js';

/**
 * Supabase Authentication Helper
 */

// 1. Sign Up
export async function signUp(email, password, displayName, phone) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                display_name: displayName,
                phone: phone
            }
        }
    });
    return { data, error };
}

// 2. Sign In with Email
export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    return { data, error };
}

// 3. Sign In with Google
export async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + '/user/panel.html'
        }
    });
    return { data, error };
}

// 4. Sign Out
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
}

// 5. Get Current User/Session
export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function getSession() {
    const { data: { session } } = await supabase.api.getSession();
    return session;
}

// 6. Listen for Auth State Changes
export function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
}

// 7. Reset Password
export async function resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/admin/reset-password.html',
    });
    return { data, error };
}
