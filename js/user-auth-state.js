import { supabase } from "./supabase-client.js";
import { onAuthStateChange, getUserProfile, signOut } from "./supabase-auth.js";
import { normalizePath } from "./utils.js";

/**
 * Update UI based on authentication state
 */
async function updateUI(user) {
    const guestItems = document.querySelectorAll('.guest-only');
    const userItems = document.querySelectorAll('.user-only');
    const adminItems = document.querySelectorAll('.admin-only');

    if (user) {
        // Hide guest items
        guestItems.forEach(el => el.style.display = 'none');

        // Fetch role to determine visibility
        const profile = await getUserProfile(user.id);
        const isAdmin = profile?.role === 'admin';

        // Show items for logged-in users
        userItems.forEach(el => el.style.display = 'flex');

        // Show/Hide admin items
        adminItems.forEach(el => {
            if (isAdmin) {
                el.style.display = 'flex';
            } else if (!el.classList.contains('user-only')) {
                // Only hide if it doesn't also have 'user-only'
                el.style.display = 'none';
            }
        });

        // Adjust links using centralized path helper
        document.querySelectorAll('.admin-only').forEach(el => {
            if (el.tagName === 'A') {
                el.href = normalizePath('/admin/');
            }
        });
        document.querySelectorAll('.user-only').forEach(el => {
            if (el.tagName === 'A') {
                el.href = normalizePath('/user/');
            }
        });

    } else {
        // Guest mode
        guestItems.forEach(el => el.style.display = 'flex');
        userItems.forEach(el => el.style.display = 'none');
        adminItems.forEach(el => el.style.display = 'none');

        const authLink = document.getElementById('user-auth-link');
        if (authLink) authLink.href = normalizePath('/login/');
    }
}

// Listen for auth changes
onAuthStateChange(async (event, session) => {
    const user = session?.user;
    await updateUI(user);

    // Global Redirection Logic:
    // If an Admin lands anywhere outside the /admin/ path, push them to the CMS
    if (user) {
        const profile = await getUserProfile(user.id);
        if (profile?.role === 'admin') {
            const path = window.location.pathname;
            if (!path.includes('/admin/')) {
                console.log("Admin detected. Redirecting to Management Panel...");
                window.location.replace(normalizePath('/admin/'));
            }
        }
    }
});

// Initial UI check when components are loaded
document.addEventListener("componentsLoaded", async () => {
    const { data: { session } } = await supabase.auth.getSession();
    await updateUI(session?.user);
});

// Global Logout Handler
window.handleLogout = async () => {
    if (confirm('آیا می‌خواهید از حساب خود خارج شوید؟')) {
        const { error } = await signOut('/index.html');
        if (error) alert('خطا در خروج: ' + error.message);
    }
};
