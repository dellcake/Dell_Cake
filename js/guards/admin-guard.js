import { onAuthStateChange, getUserProfile } from "../supabase-auth.js";
import { normalizePath } from "../utils.js";

/**
 * Admin Auth Guard
 * Ensures only users with the 'admin' role can access /admin/*
 */
export function initAdminGuard() {
    onAuthStateChange(async (event, session) => {
        const user = session?.user;
        const path = window.location.pathname;

        const isAdminPath = path.includes('/admin');
        const isAdminLogin = path.includes('/admin/login');

        if (!user) {
            // Redirect guests away from protected admin pages
            if (isAdminPath && !isAdminLogin) {
                console.warn("Guest access blocked. Redirecting to login...");
                location.replace(normalizePath("/login/"));
            }
        } else {
            // Fetch profile to verify role
            const profile = await getUserProfile(user.id);
            const isAdmin = profile?.role === 'admin';

            if (!isAdmin) {
                console.error("Access denied. User is not an admin.");
                if (isAdminPath) {
                    // Try to logout to be safe if they somehow got an admin session but aren't admin in DB
                    location.replace(normalizePath("/index.html?error=unauthorized"));
                }
            } else {
                // Authorized admin - prevent staying on admin login page
                if (isAdminLogin) {
                    location.replace(normalizePath("/admin/"));
                }
            }
        }
    });
}
