import { supabase } from "./supabase-client.js";
import { onAuthStateChange, getUserProfile, signOut } from "./supabase-auth.js";

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

/**
 * Update UI based on authentication state
 */
async function updateUI(user) {
    const base = getBase();
    const guestItems = document.querySelectorAll('.guest-only');
    const userItems = document.querySelectorAll('.user-only');
    const adminItems = document.querySelectorAll('.admin-only');

    if (user) {
        // Hide guest items
        guestItems.forEach(el => el.style.display = 'none');

        // Fetch role to determine visibility
        const profile = await getUserProfile(user.id);
        const isAdmin = profile?.role === 'admin';

        // Show appropriate items
        userItems.forEach(el => el.style.display = 'flex'); // sidebar uses flex/block

        if (isAdmin) {
            adminItems.forEach(el => el.style.display = 'flex');
        } else {
            adminItems.forEach(el => el.style.display = 'none');
        }

        // Adjust links for GitHub Pages
        const adminLink = document.querySelector('.admin-only[href*="admin/"]');
        const userLink = document.querySelector('.user-only[href*="user/"]');
        if (adminLink) adminLink.href = base + '/admin/';
        if (userLink) userLink.href = base + '/user/';

    } else {
        // Guest mode
        guestItems.forEach(el => el.style.display = 'flex');
        userItems.forEach(el => el.style.display = 'none');
        adminItems.forEach(el => el.style.display = 'none');

        const authLink = document.getElementById('user-auth-link');
        if (authLink) authLink.href = base + '/login/';
    }
}

// Listen for auth changes
onAuthStateChange(async (event, session) => {
    await updateUI(session?.user);
});

// Initial UI check when components are loaded
document.addEventListener("componentsLoaded", async () => {
    const { data: { session } } = await supabase.auth.getSession();
    await updateUI(session?.user);
});

// Global Logout Handler
window.handleLogout = async () => {
    if (confirm('آیا می‌خواهید از حساب خود خارج شوید؟')) {
        const { error } = await signOut('/');
        if (error) alert('خطا در خروج: ' + error.message);
    }
};
