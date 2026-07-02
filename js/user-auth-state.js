import { onAuthStateChange } from "./supabase-auth.js";
import { ADMIN_CONFIG } from "../admin/js/config.js";

/**
 * Helper to get the correct base URL (handles GitHub Pages subfolders)
 */
function getBase() {
    const path = window.location.pathname;
    const parts = path.split('/');
    const repo = parts[1];
    if (window.location.hostname.includes('github.io') && repo && !['admin', 'user', 'login', 'register'].includes(repo)) {
        return '/' + repo;
    }
    return '';
}

onAuthStateChange((event, session) => {
    const user = session?.user;
    const authText = document.getElementById('user-auth-text');
    const authLink = document.getElementById('user-auth-link');
    const adminLinks = document.querySelectorAll('.admin-link');
    const base = getBase();

    if (user) {
        // Change "Login" to "My Panel"
        if (authText) authText.innerText = 'پنل کاربری من';
        if (authLink) authLink.href = base + '/user/';

        // Show admin link if the logged in user is the admin
        if (user.email === ADMIN_CONFIG.adminEmail) {
            adminLinks.forEach(link => link.style.display = 'block');
        } else {
            adminLinks.forEach(link => link.style.display = 'none');
        }
    } else {
        if (authText) authText.innerText = 'ورود / عضویت';
        if (authLink) authLink.href = base + '/login/';
        adminLinks.forEach(link => link.style.display = 'none');
    }
});
