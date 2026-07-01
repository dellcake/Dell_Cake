import { onAuthStateChange } from "./supabase-auth.js";
import { ADMIN_CONFIG } from "../admin/js/config.js";

onAuthStateChange((event, session) => {
    const user = session?.user;
    const authText = document.getElementById('user-auth-text');
    const authLink = document.getElementById('user-auth-link');
    const adminLinks = document.querySelectorAll('.admin-link');

    if (user) {
        // Determine correct path based on current location
        const isSubDir = window.location.pathname.includes('/user/') ||
                         window.location.pathname.includes('/admin/') ||
                         window.location.pathname.includes('.html') && !window.location.pathname.includes('index.html');

        const panelPath = isSubDir ? 'panel.html' : 'user/panel.html';
        const loginPath = isSubDir ? 'login.html' : 'user/login.html';

        // Change "Login" to "My Panel"
        if (authText) authText.innerText = 'پنل کاربری من';
        if (authLink) authLink.href = panelPath;

        // Show admin link if the logged in user is the admin
        if (user.email === ADMIN_CONFIG.adminEmail) {
            adminLinks.forEach(link => link.style.display = 'block');
        } else {
            adminLinks.forEach(link => link.style.display = 'none');
        }
    } else {
        const isSubDir = window.location.pathname.includes('/user/') ||
                         window.location.pathname.includes('/admin/');
        const loginPath = isSubDir ? 'login.html' : 'user/login.html';

        if (authText) authText.innerText = 'ورود / عضویت';
        if (authLink) authLink.href = loginPath;
        adminLinks.forEach(link => link.style.display = 'none');
    }
});
