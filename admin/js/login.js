import { signIn, signInWithGoogle, signOut, getUserProfile, handleRoleBasedRedirect } from "../../js/supabase-auth.js";
import { initGuestGuard } from "../../js/guards/guest-guard.js";
import { normalizePath } from "../../js/utils.js";

/**
 * Admin Login Handler
 * Specifically handles authentication for the administrative dashboard.
 */

// Initialize Guest Guard to redirect logged-in users
initGuestGuard();

/**
 * Handle redirection based on user role for admin login
 */
async function handleAdminRedirect(user) {
    const profile = await getUserProfile(user.id);
    const isAdmin = profile?.role === 'admin';

    if (isAdmin) {
        // Correct path for admin dashboard
        location.replace(normalizePath("/admin/"));
    } else {
        alert("متأسفیم، شما دسترسی مدیریت ندارید.");
        await signOut(normalizePath("/index.html"));
    }
}

// Google Login Listener
document.getElementById("googleLogin").addEventListener("click", async () => {
    try {
        // Redirecting to root; the guards there will handle the role check and redirect to admin
        const redirectUrl = '/index.html';
        const { error } = await signInWithGoogle(redirectUrl);
        if (error) throw error;
    } catch (error) {
        console.error("Google Login Error:", error);
        alert("خطا در ورود با گوگل: " + error.message);
    }
});

// Email/Password Login Listener
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const submitBtn = e.target.querySelector('.submit-btn');

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> در حال بررسی...';

        const { data, error } = await signIn(email, password);

        if (error) throw error;

        if (data.user) {
            await handleRoleBasedRedirect(data.user);
        }
    } catch (error) {
        console.error("Admin Email Login Error:", error);
        alert("خطا در ورود: " + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>ورود به پنل</span> <i class="fa-solid fa-arrow-left"></i>';
    }
});
