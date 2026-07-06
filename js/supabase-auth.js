import { supabase } from './supabase-client.js';
import { normalizePath, getBaseURL as getAppBaseURL } from './utils.js';

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
export async function signInWithGoogle(redirectTo = null) {
    const baseUrl = getAppBaseURL();
    const defaultRedirect = normalizePath('/user/');

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
    try {
        // 1. Supabase Sign Out (removes session from server and local storage)
        const { error } = await supabase.auth.signOut();

        // 2. Clear all local state
        localStorage.clear();
        sessionStorage.clear();

        // 3. Clear common cookies (optional but safer)
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        if (!error && redirectTo) {
            const baseUrl = getAppBaseURL();
            let finalRedirect = redirectTo;

            if (finalRedirect.startsWith('/')) {
                finalRedirect = normalizePath(finalRedirect);
                // If it's still just starting with /, it might not have the full URL
                if (finalRedirect.startsWith('/')) {
                    finalRedirect = window.location.origin + finalRedirect;
                }
            }

            window.location.replace(finalRedirect);
        }
        return { error };
    } catch (err) {
        console.error("Logout error details:", err);
        if (redirectTo) {
            window.location.replace(normalizePath("/index.html"));
        }
        return { error: err };
    }
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

/**
 * Handle redirection based on user role
 * @param {Object} user Supabase user object
 */
export async function handleRoleBasedRedirect(user) {
    if (!user) return;

    try {
        const profile = await getUserProfile(user.id);
        const isAdmin = profile?.role === 'admin';

        if (isAdmin) {
            window.location.replace(normalizePath('/admin/'));
        } else {
            // Check if we are already in the user panel or on an auth page
            const path = window.location.pathname;
            if (path.includes('/user/') || path.includes('/login/') || path.includes('/register/')) {
                window.location.replace(normalizePath('/index.html?login=success'));
            }
        }
    } catch (error) {
        console.error("Redirection error:", error);
        window.location.replace(normalizePath('/index.html'));
    }
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
