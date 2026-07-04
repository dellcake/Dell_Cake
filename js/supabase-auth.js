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

/**
 * Helper to get the correct base URL (handles GitHub Pages subfolders)
 */
function getBaseURL() {
    const path = window.location.pathname;
    // If we are in a subfolder (like /Dell-Cake/), extract it
    const repoName = path.split('/')[1];
    const isGitHubPages = window.location.hostname.includes('github.io');

    if (isGitHubPages && repoName && !['admin', 'user', 'index.html'].includes(repoName)) {
        return `${window.location.origin}/${repoName}`;
    }
    return window.location.origin;
}

// 3. Sign In with Google
export async function signInWithGoogle(redirectTo = null) {
    const baseUrl = getBaseURL();
    const defaultRedirect = baseUrl + '/user/';

    // Ensure redirectTo starts with the base URL if it's a relative path
    let finalRedirect = redirectTo || defaultRedirect;
    if (finalRedirect.startsWith('/')) {
        finalRedirect = baseUrl + finalRedirect;
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: finalRedirect
        }
    });
    return { data, error };
}

// 4. Sign Out
export async function signOut(redirectTo = null) {
    const { error } = await supabase.auth.signOut();
    if (!error && redirectTo) {
        const baseUrl = getBaseURL();
        let finalRedirect = redirectTo;
        if (finalRedirect.startsWith('/')) {
            finalRedirect = baseUrl + finalRedirect;
        }
        window.location.replace(finalRedirect);
    }
    return { error };
}

// 5. Get Current User/Session
export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

/**
 * Get User Profile from Database
 * Returns the profile data including role
 */
export async function getUserProfile(userId) {
    if (!userId) {
        const user = await getCurrentUser();
        if (!user) return null;
        userId = user.id;
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
    return data;
}

export async function getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

// Update Profile
export async function updateProfile(options) {
    const { data, error } = await supabase.auth.updateUser(options);
    return { data, error };
}

// Update Password
export async function updatePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
        password: newPassword
    });
    return { data, error };
}

// 6. Listen for Auth State Changes
/**
 * Robust Auth State Listener
 * Handles INITIAL_SESSION, SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED
 */
export function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
        // Handle session expiry
        if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
            console.log("Auth event:", event, "Session cleared.");
        }

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
