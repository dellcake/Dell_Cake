import { onAuthStateChange, getUserProfile } from "../supabase-auth.js";
import { normalizePath } from "../utils.js";

/**
 * User Auth Guard
 * Protects /user/* and redirects guests to /login/
 * Also handles admin redirection if they land on user pages
 */
export function initUserGuard() {
    onAuthStateChange(async (event, session) => {
        const user = session?.user;
        const path = window.location.pathname;

        const isUserPath = path.includes('/user/');

        if (!user) {
            if (isUserPath) {
                console.warn("User not logged in. Redirecting to login...");
                location.replace(normalizePath("/login/"));
            }
        } else {
            // Check for admin role and redirect if necessary
            const profile = await getUserProfile(user.id);
            if (profile?.role === 'admin' && isUserPath) {
                console.log("Admin detected on user path. Redirecting to admin panel...");
                location.replace(normalizePath("/admin/"));
            }
        }
    });
}
