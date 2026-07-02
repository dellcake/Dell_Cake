import { ADMIN_CONFIG } from "../../admin/js/config.js";
import { onAuthStateChange, signOut } from "../supabase-auth.js";

/**
 * Admin Auth Guard
 * Ensures only the authorized admin can access /admin/*
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
            if (isAdminPath && !isAdminLogin) {
                console.warn("Unauthorized admin access. Redirecting to admin login...");
                location.replace(base + "/admin/login/");
            }
        } else {
            if (user.email !== ADMIN_CONFIG.adminEmail) {
                console.error("Access denied. User is not the admin.");
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
