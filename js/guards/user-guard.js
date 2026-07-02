import { onAuthStateChange } from "../supabase-auth.js";

/**
 * User Auth Guard
 * Protects /user/* and redirects guests to /login/
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

        if (!user && isUserPath) {
            console.warn("User not logged in. Redirecting to login...");
            location.replace(base + "/login/");
        }
    });
}
