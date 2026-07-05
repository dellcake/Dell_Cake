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

        if (user && isAuthPage) {
            const profile = await getUserProfile(user.id);
            if (profile?.role === 'admin') {
                location.replace(normalizePath("/admin/"));
            } else {
                // If on /login/ or /register/, redirect to home after login as per requirement
                location.replace(normalizePath("/index.html"));
            }
        }
    });
}
