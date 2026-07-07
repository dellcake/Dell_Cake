import { supabase } from '../../js/supabase-client.js';

const ADMIN_EMAIL = 'sobhanrahimisrj@gmail.com';
const loginBtn = document.getElementById('google-login-btn');
const errorBox = document.getElementById('error-box');

if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/admin/index.html'
                }
            });

            if (error) throw error;
            // Note: For OAuth, the redirect happens automatically.
            // The auth-guard will handle the session check on the index.html page.
        } catch (error) {
            console.error('Login Error:', error);
            showError('خطا در برقراری ارتباط با گوگل. لطفا دوباره تلاش کنید.');
        }
    });
}

// Check if user is already logged in or just returned from OAuth
async function checkInitialSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        if (session.user.email === ADMIN_EMAIL) {
            location.replace('index.html');
        } else {
            await supabase.auth.signOut();
            showError('شما دسترسی لازم برای ورود به این پنل را ندارید.');
        }
    }
}

function showError(msg) {
    errorBox.innerText = msg;
    errorBox.style.display = 'block';
}

checkInitialSession();
