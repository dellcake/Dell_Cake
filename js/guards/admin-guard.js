import { onAuthStateChange, getUserProfile } from "../supabase-auth.js";

/**
 * Admin Auth Guard
 * Ensures only users with the 'admin' role can access /admin/*
 */
export function initAdminGuard() {
    onAuthStateChange(async (event, session) => {
        const user = session?.user;
        const path = window.location.pathname;

        // Base URL helper (handles GitHub Pages)
        const getBase = () => {
            const parts = path.split('/');
            const repo = parts[1];
            if (window.location.hostname.includes('github.io') && repo && !['admin', 'user', 'login', 'register'].includes(repo)) {
                return '/' + repo;
            }
            return '';
        };

        const base = getBase();
        const isAdminPath = path.includes('/admin');
        const isAdminLogin = path.includes('/admin/login');

        if (!user) {
            // Redirect guests away from protected admin pages
            if (isAdminPath && !isAdminLogin) {
                console.warn("Guest access blocked. Redirecting to login...");
                location.replace(base + "/login/");
            }
        } else {
            // Fetch profile to verify role
            const profile = await getUserProfile(user.id);
            const isAdmin = profile?.role === 'admin';

            if (!isAdmin) {
                console.error("Access denied. User is not an admin.");
                if (isAdminPath) {
                    location.replace(base + "/user/");
                }
            } else {
                // Authorized admin
                if (isAdminLogin) {
                    location.replace(base + "/admin/");
                }
            }
        }
    });
}
