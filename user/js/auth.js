import { signIn, signUp, signInWithGoogle, getUserProfile } from "../../js/supabase-auth.js";
import { initGuestGuard } from "../../js/guards/guest-guard.js";

/**
 * User Authentication Handler
 * Manages Google OAuth and Email/Password flows for the main site.
 */

// Initialize Guest Guard to redirect logged-in users away from login/register
initGuestGuard();

const googleBtn = document.getElementById('google-login');
const emailBtn = document.getElementById('email-auth');

/**
 * Handle redirection based on user role
 */
async function handleRoleBasedRedirect(user) {
    const profile = await getUserProfile(user.id);
    const isAdmin = profile?.role === 'admin';

    if (isAdmin) {
        window.location.replace('../admin/');
    } else {
        window.location.replace('../user/');
    }
}

// Google Login Listener
googleBtn.addEventListener('click', async () => {
    try {
        // The redirectTo is a hint; the actual landing page will handle the final hop via Auth guards
        const redirectUrl = '/user/';
        const { error } = await signInWithGoogle(redirectUrl);
        if (error) throw error;
    } catch (error) {
        console.error("Google login failed", error);
        alert("خطا در ورود با گوگل: " + error.message);
    }
});

// Email/Password Login & Auto-registration Listener
emailBtn.addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) return alert('لطفا ایمیل و رمز عبور را وارد کنید');

    try {
        // 1. Attempt Sign In
        const { data, error: signInError } = await signIn(email, password);

        if (signInError) {
            // 2. If login fails due to credentials, attempt Sign Up (User-friendly flow)
            if (signInError.status === 400 || signInError.message.includes("Invalid login credentials")) {
                const { data: signUpData, error: signUpError } = await signUp(email, password, 'مشتری جدید', '');

                if (signUpError) throw signUpError;

                if (signUpData.user) {
                    alert('حساب کاربری با موفقیت ایجاد شد.');
                    await handleRoleBasedRedirect(signUpData.user);
                }
            } else {
                throw signInError;
            }
        } else if (data.user) {
            // Successful Sign In
            await handleRoleBasedRedirect(data.user);
        }
    } catch (error) {
        console.error("Authentication process failed", error);
        alert("خطا در ورود/ثبت‌نام: " + error.message);
    }
});
