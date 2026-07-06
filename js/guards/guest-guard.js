import { onAuthStateChange, getUserProfile } from "../supabase-auth.js";
import { normalizePath } from "../utils.js";

/**
 * Guest Auth Guard
 * Prevents logged-in users from seeing /login and /register
 */
export function initGuestGuard() {
    onAuthStateChange(async (event, session) => {
        const user = session?.user;
        const path = window.location.pathname;

        const isAuthPage = path.includes('/login/') || path.includes('/register/');

        if (user) {
            const profile = await getUserProfile(user.id);
            const isAdmin = profile?.role === 'admin';

            if (isAdmin) {
                // Admins should NOT be on guest pages
                if (isAuthPage || path.includes('/user/')) {
                    location.replace(normalizePath("/admin/"));
                }
            } else {
                // Regular users should NOT be on guest pages
                if (isAuthPage) {
                    location.replace(normalizePath("/index.html"));
                }
            }
        }
    });
}
