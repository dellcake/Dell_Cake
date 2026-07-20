import { supabase } from '../../js/supabase-client.js';

const ADMIN_EMAIL = 'dellcake.orders@gmail.com';

async function checkAuth() {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
        handleUnauthorized();
        return;
    }

    const user = session.user;

    // Strict validation: Check both hardcoded email and database role
    try {
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || !profile || profile.role !== 'admin' || user.email !== ADMIN_EMAIL) {
            console.error('Security Breach: Unauthorized access attempt by', user.email);
            handleUnauthorized();
            return;
        }
    } catch (err) {
        console.error('Auth check error:', err);
        handleUnauthorized();
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

function handleUnauthorized() {
    console.warn('Redirecting unauthorized user...');
    supabase.auth.signOut().then(() => {
        // Use location.replace to prevent back-button navigation to protected areas
        const loginPath = location.pathname.includes('/admin/') ? 'login.html' : '/admin/login.html';
        location.replace(`${loginPath}?error=unauthorized&t=${Date.now()}`);
    });
}

// Listen for auth changes to handle session expiration or manual logout
supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
        location.replace('login.html');
    }

    if (event === 'SIGNED_IN' && session) {
        // Re-verify if the newly signed in user is an admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

        if (!profile || profile.role !== 'admin') {
            handleUnauthorized();
        }
    }
});

// Run immediate check
checkAuth();
