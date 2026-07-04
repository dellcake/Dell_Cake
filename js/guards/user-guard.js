import { onAuthStateChange, getUserProfile } from "../supabase-auth.js";

/**
 * User Auth Guard
 * Protects /user/* and redirects guests to /login/
 * Also handles admin redirection if they land on user pages
 */
export function initUserGuard() {
    onAuthStateChange(async (event, session) => {
        const user = session?.user;
        const path = window.location.pathname;

        const getBase = () => {
            const parts = path.split('/');
            const repo = parts[1];
            if (window.location.hostname.includes('github.io') && repo && !['admin', 'user', 'login', 'register'].includes(repo)) {
                return '/' + repo;
            }
            return '';
        };

        const base = getBase();
        const isUserPath = path.includes('/user/');

        if (!user) {
            if (isUserPath) {
                console.warn("User not logged in. Redirecting to login...");
                location.replace(base + "/login/");
            }
        } else {
            // Check for admin role and redirect if necessary
            const profile = await getUserProfile(user.id);
            if (profile?.role === 'admin' && isUserPath) {
                console.log("Admin detected on user path. Redirecting to admin panel...");
                location.replace(base + "/admin/");
            }
        }
    });
}
