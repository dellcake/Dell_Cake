import { onAuthStateChange, getUserProfile } from "../supabase-auth.js";

/**
 * Guest Auth Guard
 * Prevents logged-in users from seeing /login and /register
 */
export function initGuestGuard() {
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
        const isAuthPage = path.includes('/login/') || path.includes('/register/');

        if (user && isAuthPage) {
            const profile = await getUserProfile(user.id);
            if (profile?.role === 'admin') {
                location.replace(base + "/admin/");
            } else {
                location.replace(base + "/user/");
            }
        }
    });
}
