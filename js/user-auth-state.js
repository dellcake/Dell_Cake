import { onAuthStateChange } from "./supabase-auth.js";
import { ADMIN_CONFIG } from "../admin/js/config.js";

onAuthStateChange((event, session) => {
    const user = session?.user;
    const authText = document.getElementById('user-auth-text');
    const authLink = document.getElementById('user-auth-link');
    const adminLinks = document.querySelectorAll('.admin-link');

    if (user) {
        // Change "Login" to "My Panel"
        if (authText) authText.innerText = 'پنل کاربری من';
        if (authLink) authLink.href = 'user/panel.html';

        // Show admin link if the logged in user is the admin
        if (user.email === ADMIN_CONFIG.adminEmail) {
            adminLinks.forEach(link => link.style.display = 'block');
        } else {
            adminLinks.forEach(link => link.style.display = 'none');
        }
    } else {
        if (authText) authText.innerText = 'ورود / عضویت';
        if (authLink) authLink.href = 'user/login.html';
        adminLinks.forEach(link => link.style.display = 'none');
    }
});
