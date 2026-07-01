import { supabase } from "../../js/supabase-client.js";
import { onAuthStateChange, signOut, updateProfile } from "../../js/supabase-auth.js";

let currentUser = null;
let userOrders = [];
let enrolledCourses = [];

// Tab Navigation
window.switchUserTab = (tabName, el = null) => {
    // Update Sidebar UI
    if (el) {
        document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
        el.classList.add('active');
    }

    // Toggle Sections
    document.querySelectorAll('.user-view').forEach(view => {
        view.style.display = 'none';
        view.classList.remove('active');
    });

    const targetView = document.getElementById(`view-${tabName}`);
    if (targetView) {
        targetView.style.display = 'block';
        targetView.classList.add('active');
    }

    // Update Breadcrumb
    const breadcrumb = document.getElementById('user-breadcrumb');
    if (breadcrumb) {
        const labels = {
            'overview': 'پیشخوان',
            'courses': 'دوره‌های من',
            'orders': 'سفارشات',
            'profile': 'تنظیمات پروفایل',
            'player': 'مشاهده دوره'
        };
        breadcrumb.innerHTML = `<span>پنل کاربری</span> / <span>${labels[tabName] || tabName}</span>`;
    }

    if (tabName === 'courses') loadEnrolledCourses();
    if (tabName === 'orders') loadUserOrders();
};

onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT' || !session) {
        window.location.replace('login.html');
        return;
    }

    currentUser = session.user;

    // UI Updates
    const displayName = currentUser.user_metadata?.display_name || currentUser.email.split('@')[0];
    document.getElementById('user-display-name').innerText = displayName;
    document.getElementById('welcome-msg').innerText = `سلام ${displayName} عزیز!`;

    // Fill Profile Form
    document.getElementById('profile-email').value = currentUser.email;
    document.getElementById('profile-name').value = currentUser.user_metadata?.display_name || '';
    document.getElementById('profile-phone').value = currentUser.user_metadata?.phone || '';

    // Load initial stats
    updateUserStats();
});

async function updateUserStats() {
    if (!currentUser) return;

    try {
        // Orders count
        const { count: orderCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', currentUser.id);

        document.getElementById('stat-orders-count').innerText = (orderCount || 0).toLocaleString('fa-IR');

        // Courses count
        const { count: courseCount } = await supabase
            .from('user_courses')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', currentUser.id);

        document.getElementById('stat-courses-count').innerText = (courseCount || 0).toLocaleString('fa-IR');
    } catch (err) {
        console.error("Error updating stats:", err);
    }
}

async function loadUserOrders() {
    const tbody = document.getElementById('user-orders-tbody');
    if (!tbody || !currentUser) return;

    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">در حال بارگذاری...</td></tr>';

    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        userOrders = data;

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">هنوز سفارشی ثبت نکرده‌اید.</td></tr>';
        } else {
            tbody.innerHTML = data.map(order => `
                <tr>
                    <td>#${order.id.slice(-6).toUpperCase()}</td>
                    <td>${order.product_name}</td>
                    <td>${(Number(order.price) || 0).toLocaleString('fa-IR')}</td>
                    <td>${new Date(order.created_at).toLocaleDateString('fa-IR')}</td>
                    <td><span class="status-badge ${order.status}">${translateStatus(order.status)}</span></td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error("Error loading orders:", error);
    }
}

async function loadEnrolledCourses() {
    const grid = document.getElementById('enrolled-courses-list');
    if (!grid || !currentUser) return;

    try {
        const { data, error } = await supabase
            .from('user_courses')
            .select(`
                *,
                course:courses(*)
            `)
            .eq('user_id', currentUser.id);

        if (error) throw error;
        enrolledCourses = data;

        if (data.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding:40px;">هنوز در دوره‌ای ثبت‌نام نکرده‌اید.</p>';
        } else {
            grid.innerHTML = data.map(item => `
                <div class="course-card">
                    <div class="course-image" style="background-image: url('${item.course.image_url || '../images/placeholder-course.jpg'}')"></div>
                    <div class="course-body">
                        <h4>${item.course.title}</h4>
                        <p style="font-size:0.85rem; color:#888; margin-bottom:15px;">مدت دوره: ${item.course.duration || 'نامشخص'}</p>
                        <button class="btn-access" onclick="openCoursePlayer('${item.course.id}')">ورود به کلاس <i class="fa-solid fa-play-circle"></i></button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error("Error loading enrolled courses:", error);
    }
}

window.openCoursePlayer = (courseId) => {
    const enrollment = enrolledCourses.find(e => e.course_id === courseId);
    if (!enrollment) return;

    const course = enrollment.course;
    document.getElementById('player-course-title').innerText = course.title;

    const contentArea = document.getElementById('course-content-area');
    contentArea.innerHTML = `
        <div style="margin-bottom:20px;">
            <h3>درباره این دوره</h3>
            <p>${course.description || 'توضیحاتی ثبت نشده است.'}</p>
        </div>
        <div>
            <h3>محتوای پکیج</h3>
            <ul style="list-style: none; padding:0;">
                ${course.package_content ? course.package_content.map(item => `
                    <li style="padding:10px; border-bottom:1px solid #f0f0f0;"><i class="fa-solid fa-circle-check" style="color:#2ed573; margin-left:10px;"></i> ${item}</li>
                `).join('') : '<li>لیستی موجود نیست</li>'}
            </ul>
        </div>
        <div style="margin-top:30px; padding:20px; background:#fff9fa; border-radius:10px; text-align:center;">
            <p>لینک‌های دانلود و ویدیوها بزودی در این بخش قرار می‌گیرند.</p>
            <button class="btn-secondary" onclick="alert('ارتباط با مدرس در تلگرام: @DellCake_Support')">ارتباط با پشتیبانی دوره</button>
        </div>
    `;

    switchUserTab('player');
};

document.getElementById('user-profile-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.innerText = 'در حال ذخیره...';

    try {
        const { error } = await updateProfile({
            data: {
                display_name: document.getElementById('profile-name').value.trim(),
                phone: document.getElementById('profile-phone').value.trim()
            }
        });

        if (error) throw error;
        alert('پروفایل با موفقیت بروزرسانی شد');
    } catch (error) {
        alert('خطا در بروزرسانی: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.innerText = 'ذخیره تغییرات';
    }
});

function translateStatus(status) {
    const map = {
        'new': 'جدید',
        'pending': 'در حال بررسی',
        'preparing': 'آماده‌سازی',
        'ready': 'آماده تحویل',
        'completed': 'تحویل شده',
        'cancelled': 'لغو شده'
    };
    return map[status] || status;
}

window.handleLogout = async () => {
    if (confirm('آیا می‌خواهید از حساب خود خارج شوید؟')) {
        await signOut();
        window.location.replace('login.html');
    }
};
