import { supabase } from "../../js/supabase-client.js";
import { onAuthStateChange, signOut, updateProfile, updatePassword, getUserProfile } from "../../js/supabase-auth.js";

// --- State Management ---
let currentUser = null;
let userProfile = null;
let orders = [];
let enrollments = [];

// --- Tab Navigation ---
window.switchView = (viewName, el = null) => {
    // 1. Sidebar UI Update
    if (el) {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        el.classList.add('active');
    }

    // 2. Hide all views
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
    });

    // 3. Show target view
    const target = document.getElementById(`view-${viewName}`);
    if (target) target.classList.add('active');

    // 4. Update Header Title
    const titles = {
        'dashboard': 'پیشخوان',
        'courses': 'دوره‌های من',
        'orders': 'سفارش‌های من',
        'profile': 'ویرایش پروفایل',
        'settings': 'امنیت و تنظیمات'
    };
    document.getElementById('view-title').innerText = titles[viewName] || 'پنل کاربری';

    // 5. Load Data for specific views
    if (viewName === 'orders') loadOrders();
    if (viewName === 'courses') loadCourses();

    // Close sidebar on mobile after selection
    if (window.innerWidth <= 1100) {
        document.getElementById('sidebar').classList.remove('active');
    }
};

// --- Auth State Listener ---
onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (!session) return;
        currentUser = session.user;
        await refreshUserData();
    } else if (event === 'SIGNED_OUT') {
        location.replace('../login/');
    }
});

async function refreshUserData() {
    if (!currentUser) return;

    // Fetch Profile from DB
    userProfile = await getUserProfile(currentUser.id);

    // Update UI
    const name = userProfile?.full_name || currentUser.email.split('@')[0];
    const email = currentUser.email;

    document.getElementById('header-user-name').innerText = name;
    document.getElementById('greeting-name').innerText = `سلام ${name} عزیز!`;
    document.getElementById('summary-name').innerText = name;
    document.getElementById('summary-email').innerText = email;

    // Join Date
    const joinDate = new Date(currentUser.created_at).toLocaleDateString('fa-IR');
    document.getElementById('join-date').innerText = joinDate;

    // Avatar
    updateAvatarUI(userProfile?.avatar_url);

    // Fill Profile Form
    document.getElementById('full-name-input').value = userProfile?.full_name || '';
    document.getElementById('phone-input').value = userProfile?.phone || '';
    document.getElementById('email-input').value = currentUser.email;
    document.getElementById('address-input').value = userProfile?.address || '';

    // Dashboard Stats
    updateDashboardStats();
}

function updateAvatarUI(url) {
    const headerAvatar = document.getElementById('header-avatar');
    const profileLargeAvatar = document.getElementById('profile-large-avatar');
    const summaryAvatar = document.getElementById('summary-avatar');

    const html = url
        ? `<img src="${url}" alt="Avatar">`
        : `<i class="fa-solid fa-user"></i>`;

    if (headerAvatar) headerAvatar.innerHTML = html;
    if (profileLargeAvatar) profileLargeAvatar.innerHTML = html;
    if (summaryAvatar) summaryAvatar.innerHTML = html;
}

// --- Dashboard Stats ---
async function updateDashboardStats() {
    try {
        const [ordersRes, coursesRes] = await Promise.all([
            supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', currentUser.id),
            supabase.from('user_courses').select('id', { count: 'exact', head: true }).eq('user_id', currentUser.id)
        ]);

        document.getElementById('total-orders-count').innerText = `${(ordersRes.count || 0).toLocaleString('fa-IR')} مورد`;
        document.getElementById('active-courses-count').innerText = `${(coursesRes.count || 0).toLocaleString('fa-IR')} دوره`;
    } catch (err) {
        console.error("Stats Error:", err);
    }
}

// --- Orders Logic ---
async function loadOrders() {
    const tbody = document.getElementById('orders-tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">در حال جستجوی سفارش‌ها...</td></tr>';

    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        orders = data;

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 40px;">هنوز سفارشی ثبت نکرده‌اید.</td></tr>';
        } else {
            tbody.innerHTML = data.map((order, index) => `
                <tr>
                    <td style="font-weight:bold; color:var(--primary-pink)">#${order.id.slice(-6).toUpperCase()}</td>
                    <td style="font-weight:700;">${order.product_name}</td>
                    <td>${(Number(order.price) || 0).toLocaleString('fa-IR')} تومان</td>
                    <td>${new Date(order.created_at).toLocaleDateString('fa-IR')}</td>
                    <td><span class="status-pill ${order.status}">${translateStatus(order.status)}</span></td>
                </tr>
            `).join('');
        }
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5" style="color:red">خطا در بارگذاری سفارش‌ها</td></tr>';
    }
}

// --- Courses Logic ---
async function loadCourses() {
    const container = document.getElementById('courses-list');
    if (!container) return;

    container.innerHTML = '<div style="grid-column:1/-1; text-align:center;"><i class="fa-solid fa-spinner fa-spin fa-3x" style="color:var(--primary-pink)"></i></div>';

    try {
        const { data, error } = await supabase
            .from('user_courses')
            .select('*, courses(*)')
            .eq('user_id', currentUser.id);

        if (error) throw error;
        enrollments = data;

        if (data.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 50px;">هنوز در دوره‌ای ثبت‌نام نکرده‌اید.</p>';
        } else {
            container.innerHTML = data.map(item => {
                const c = item.courses;
                return `
                <div class="course-card animate__animated animate__fadeInUp">
                    <div class="course-thumb">
                        <img src="${c.image_url || '../images/placeholder-course.jpg'}" alt="${c.title}">
                        <span class="course-badge">${translateCategory(c.category)}</span>
                    </div>
                    <div class="course-info">
                        <h3>${c.title}</h3>
                        <p>${c.description || 'توضیحات این دوره آموزشی...'}</p>
                        <button class="btn-enter" onclick="alert('ورود به پنل پخش دوره: ${c.title}')">
                            <i class="fa-solid fa-circle-play"></i> ورود به کلاس درس
                        </button>
                    </div>
                </div>
                `;
            }).join('');
        }
    } catch (err) {
        container.innerHTML = '<p>خطا در بارگذاری دوره‌ها</p>';
    }
}

// --- Profile Management ---
document.getElementById('profile-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('save-profile-btn');
    const originalText = btn.innerText;

    btn.disabled = true;
    btn.innerText = 'در حال ذخیره...';

    const updates = {
        full_name: document.getElementById('full-name-input').value.trim(),
        phone: document.getElementById('phone-input').value.trim(),
        address: document.getElementById('address-input').value.trim(),
        updated_at: new Date().toISOString()
    };

    try {
        // 1. Update Profile in DB
        const { error: dbError } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', currentUser.id);

        if (dbError) throw dbError;

        // 2. Update Auth Metadata
        await updateProfile({
            data: {
                display_name: updates.full_name,
                phone: updates.phone
            }
        });

        alert('پروفایل شما با موفقیت بروزرسانی شد ✨');
        refreshUserData();
    } catch (err) {
        alert('خطا: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.innerText = originalText;
    }
});

// Avatar Upload
document.getElementById('avatar-input')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${currentUser.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // Upload
        const { error: uploadError } = await supabase.storage
            .from('profiles')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get URL
        const { data: { publicUrl } } = supabase.storage
            .from('profiles')
            .getPublicUrl(filePath);

        // Update DB
        const { error: dbError } = await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('id', currentUser.id);

        if (dbError) throw dbError;

        updateAvatarUI(publicUrl);
        alert('عکس پروفایل با موفقیت تغییر کرد ✨');
    } catch (err) {
        alert('خطا در آپلود عکس: ' + err.message);
    }
});

// --- Security ---
document.getElementById('password-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPass = document.getElementById('new-password').value;
    const confirmPass = document.getElementById('confirm-password').value;

    if (newPass !== confirmPass) {
        return alert('رمز عبور و تکرار آن مطابقت ندارند');
    }

    const btn = document.getElementById('change-pass-btn');
    btn.disabled = true;
    btn.innerText = 'در حال تغییر...';

    try {
        const { error } = await updatePassword(newPass);
        if (error) throw error;
        alert('رمز عبور با موفقیت تغییر کرد 🔒');
        e.target.reset();
    } catch (err) {
        alert('خطا: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.innerText = 'تغییر رمز عبور';
    }
});

// --- Helpers ---
function translateStatus(s) {
    const map = { 'new': 'جدید', 'pending': 'در انتظار', 'preparing': 'در حال آماده‌سازی', 'completed': 'تحویل شده', 'cancelled': 'لغو شده' };
    return map[s] || s;
}

function translateCategory(c) {
    const map = { 'cake': 'کیک', 'pastry': 'شیرینی', 'dessert': 'دسر' };
    return map[c] || c;
}

window.confirmLogout = async () => {
    if (confirm('آیا می‌خواهید از حساب خود خارج شوید؟')) {
        await signOut('../login/');
    }
};
