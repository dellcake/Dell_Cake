import { supabase } from "../../js/supabase-client.js";
import { signIn, signUp, signInWithGoogle } from "../../js/supabase-auth.js";
import { initGuestGuard } from "../../js/guards/guest-guard.js";

// Initialize Guest Guard to redirect logged-in users away from login/register
initGuestGuard();

const googleBtn = document.getElementById('google-login');
const emailBtn = document.getElementById('email-auth');

async function saveProfile(user) {
    // In Supabase, we usually use triggers to create profiles.
    // But we can also do it manually for extra safety during migration.
    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            display_name: user.user_metadata.display_name || user.user_metadata.full_name || 'مشتری جدید',
            email: user.email,
            updated_at: new Date()
        }, { onConflict: 'id' });

    if (error) console.error("Error saving profile", error);
}

googleBtn.addEventListener('click', async () => {
    try {
        // Passing a relative path; supabase-auth.js helper will prepend the correct base URL
        const redirectUrl = '/user/';
        const { error } = await signInWithGoogle(redirectUrl);
        if (error) throw error;
        // Redirect is handled by Supabase OAuth
    } catch (error) {
        console.error("Google login failed", error);
        alert("خطا در ورود با گوگل: " + error.message);
    }
});

emailBtn.addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) return alert('لطفا ایمیل و رمز عبور را وارد کنید');

    try {
        // 1. Try Login
        const { data, error: signInError } = await signIn(email, password);

        if (signInError) {
            // 2. If login fails, try Signup (Simplified flow for Dell Cake)
            if (signInError.status === 400 || signInError.message.includes("Invalid login credentials")) {
                const { data: signUpData, error: signUpError } = await signUp(email, password, 'مشتری جدید', '');

                if (signUpError) {
                    throw signUpError;
                }

                if (signUpData.user) {
                    await saveProfile(signUpData.user);
                    alert('حساب کاربری با موفقیت ایجاد شد.');
                    window.location.replace('../user/');
                }
            } else {
                throw signInError;
            }
        } else if (data.user) {
            await saveProfile(data.user);
            window.location.replace('../user/');
        }
    } catch (error) {
        console.error("Auth process failed", error);
        alert("خطا در ورود/ثبت‌نام: " + error.message);
    }
});
