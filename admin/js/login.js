import { supabase } from '../../js/supabase-client.js';

const ADMIN_EMAIL = 'dellcake.orders@gmail.com';
const loginBtn = document.getElementById('google-login-btn');
const errorBox = document.getElementById('error-box');

if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        console.log('Login button clicked...');
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/admin/index.html'
                }
            });

            if (error) {
                console.error('Supabase Auth Error:', error);
                showError(error.message || 'خطا در برقراری ارتباط با گوگل.');
                return;
            }

            console.log('OAuth sign-in initiated successfully');
        } catch (error) {
            console.error('Unexpected Login Error:', error);
            showError('خطای غیرمنتظره رخ داد. لطفا کنسول مرورگر را بررسی کنید.');
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
