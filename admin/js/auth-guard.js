import { supabase } from '../../js/supabase-client.js';

const ADMIN_EMAIL = 'sobhanrahimisrj@gmail.com';

async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        location.replace('login.html');
        return;
    }

    const user = session.user;

    if (user.email !== ADMIN_EMAIL) {
        await supabase.auth.signOut();
        location.replace('login.html?error=unauthorized');
        return;
    }

    // Authorized admin
    console.log('Welcome Admin:', user.email);

    // Update UI with admin info
    const adminNameEl = document.querySelector('.user-profile .name');
    if (adminNameEl) {
        adminNameEl.innerText = user.user_metadata.full_name || user.user_metadata.name || 'مدیر سایت';
    }

    const avatarEl = document.querySelector('.user-profile .avatar');
    if (avatarEl && (user.user_metadata.avatar_url || user.user_metadata.picture)) {
        avatarEl.src = user.user_metadata.avatar_url || user.user_metadata.picture;
    }
}

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
        location.replace('login.html');
    }
});

checkAuth();
