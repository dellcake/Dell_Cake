import { ADMIN_CONFIG } from "./config.js";
import { db } from "../../js/firebase-db.js";
import { auth } from "../../js/firebase-auth.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Layout Loader
async function loadComponent(id, path) {
    try {
        const response = await fetch(path);
        const html = await response.text();
        document.getElementById(id).innerHTML = html;
        return true;
    } catch (error) {
        console.error(`Error loading ${path}:`, error);
        return false;
    }
}

// State
let currentView = 'Dashboard';
let unsubscribers = [];

function clearListeners() {
    unsubscribers.forEach(unsub => {
        if (typeof unsub === 'function') unsub();
    });
    unsubscribers = [];
}

// Navigation Logic
window.navigateTo = async (viewName) => {
    currentView = viewName;
    clearListeners();
    const mainView = document.getElementById('main-view');
    mainView.innerHTML = '<div class="loader-wrapper"><div class="loader"></div></div>';

    // Update active state in sidebar
    document.querySelectorAll('.sidebar-nav li').forEach(li => {
        li.classList.remove('active');
        if (li.getAttribute('onclick')?.includes(`'${viewName}'`)) {
            li.classList.add('active');
        }
    });

    // Update Title and Breadcrumb
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) pageTitle.innerText = getTranslate(viewName);

    const breadcrumb = document.getElementById('breadcrumb');
    if (breadcrumb) breadcrumb.innerHTML = `<span>پنل مدیریت</span> / <span>${getTranslate(viewName)}</span>`;

    // Load View
    const success = await loadComponent('main-view', `pages/${viewName.toLowerCase()}.html`);
    if (!success) {
        mainView.innerHTML = '<h2>خطا در بارگذاری صفحه</h2>';
    } else {
        // Initialize View Logic if any
        initViewLogic(viewName);
    }
};

function getTranslate(key) {
    const map = {
        'Dashboard': 'داشبورد',
        'Orders': 'سفارشات',
        'Courses': 'دوره‌ها',
        'Gallery': 'گالری',
        'Blog': 'بلاگ',
        'Messages': 'پیام‌ها',
        'Customers': 'مشتریان',
        'Settings': 'تنظیمات',
        'Profile': 'پروفایل'
    };
    return map[key] || key;
}

function initViewLogic(view) {
    console.log(`Initializing logic for ${view}`);
    if (view === 'Dashboard') {
        loadDashboardStats();
    } else if (view === 'Courses') {
        loadCourses();
    } else if (view === 'Orders') {
        loadOrders();
    }
}

// Dashboard Logic
async function loadDashboardStats() {
    const unsubCourses = onSnapshot(collection(db, "courses"), (snapshot) => {
        const count = snapshot.size;
        const el = document.getElementById('total-courses');
        if (el) el.innerText = count.toLocaleString('fa-IR');
    });
    unsubscribers.push(unsubCourses);

    const unsubOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const newOrdersCount = orders.filter(o => o.status === 'pending').length;
        const el = document.getElementById('new-orders');
        if (el) el.innerText = newOrdersCount.toLocaleString('fa-IR');

        // Recent activities
        const activityList = document.getElementById('activities-list');
        if (activityList) {
            if (orders.length === 0) {
                activityList.innerHTML = '<p class="empty-msg">فعالیتی ثبت نشده است.</p>';
            } else {
                activityList.innerHTML = orders.slice(0, 5).map(order => `
                    <div class="activity-item">
                        <div class="activity-icon"><i class="fa-solid fa-shopping-cart"></i></div>
                        <div class="activity-text">
                            <strong>${order.customerName || 'مشتری'}</strong> یک سفارش جدید ثبت کرد.
                            <span>${new Date(order.createdAt?.seconds * 1000).toLocaleDateString('fa-IR')}</span>
                        </div>
                    </div>
                `).join('');
            }
        }
    });
    unsubscribers.push(unsubOrders);
}

// Courses Logic
let courses = [];
function loadCourses() {
    const unsub = onSnapshot(collection(db, "courses"), (snapshot) => {
        courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const tbody = document.getElementById('courses-tbody');
        if (!tbody) return;

        if (courses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">دوره ای یافت نشد.</td></tr>';
        } else {
            tbody.innerHTML = courses.map(course => `
                <tr>
                    <td><img src="${course.image || '../assets/placeholder.jpg'}" width="50" style="border-radius:8px"></td>
                    <td>${course.title}</td>
                    <td>${Number(course.price).toLocaleString('fa-IR')} تومان</td>
                    <td>${course.level || 'متوسط'}</td>
                    <td>
                        <div class="actions">
                            <button class="btn-icon btn-edit" onclick="openCourseModal('${course.id}')"><i class="fa-solid fa-edit"></i></button>
                            <button class="btn-icon btn-delete" onclick="deleteCourse('${course.id}')"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    });
    unsubscribers.push(unsub);
}

window.openCourseModal = (courseId = null) => {
    const modal = document.getElementById('course-modal');
    const form = document.getElementById('course-form');
    if (!modal || !form) return;

    if (courseId) {
        const course = courses.find(c => c.id === courseId);
        form.courseId.value = course.id;
        form.title.value = course.title;
        form.price.value = course.price;
        form.level.value = course.level || 'intermediate';
        form.image.value = course.image || '';
        form.packageContent.value = Array.isArray(course.package) ? course.package.join('\n') : '';
        document.getElementById('modal-title').innerText = 'ویرایش دوره';
    } else {
        form.reset();
        form.courseId.value = '';
        document.getElementById('modal-title').innerText = 'افزودن دوره جدید';
    }
    modal.style.display = 'flex';
};

window.closeCourseModal = () => {
    document.getElementById('course-modal').style.display = 'none';
};

window.saveCourse = async (event) => {
    event.preventDefault();
    const form = event.target;
    const courseData = {
        title: form.title.value,
        price: Number(form.price.value),
        level: form.level.value,
        image: form.image.value,
        package: form.packageContent.value.split('\n').filter(line => line.trim() !== ''),
        updatedAt: new Date()
    };

    try {
        if (form.courseId.value) {
            await updateDoc(doc(db, "courses", form.courseId.value), courseData);
        } else {
            courseData.createdAt = new Date();
            await addDoc(collection(db, "courses"), courseData);
        }
        closeCourseModal();
    } catch (error) {
        alert('خطا در ذخیره دوره: ' + error.message);
    }
};

window.deleteCourse = async (id) => {
    if (confirm('آیا از حذف این دوره اطمینان دارید؟')) {
        await deleteDoc(doc(db, "courses", id));
    }
};

// Orders Logic
function loadOrders() {
    const unsub = onSnapshot(collection(db, "orders"), (snapshot) => {
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const tbody = document.getElementById('orders-tbody');
        if (!tbody) return;

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">سفارشی ثبت نشده است.</td></tr>';
        } else {
            tbody.innerHTML = orders.map(order => `
                <tr>
                    <td>${order.customerName || 'نامشخص'}</td>
                    <td>${order.productName || 'محصول'}</td>
                    <td>${new Date(order.createdAt?.seconds * 1000).toLocaleDateString('fa-IR')}</td>
                    <td><span class="status-badge ${order.status}">${translateStatus(order.status)}</span></td>
                    <td>
                        <select onchange="updateOrderStatus('${order.id}', this.value)" class="status-select">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>در انتظار</option>
                            <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>در حال آماده‌سازی</option>
                            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>تکمیل شده</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>لغو شده</option>
                        </select>
                    </td>
                </tr>
            `).join('');
        }
    });
    unsubscribers.push(unsub);
}

function translateStatus(status) {
    const map = {
        'pending': 'در انتظار',
        'preparing': 'در حال پخت',
        'completed': 'تحویل شده',
        'cancelled': 'لغو شده'
    };
    return map[status] || status;
}

window.updateOrderStatus = async (id, newStatus) => {
    try {
        await updateDoc(doc(db, "orders", id), { status: newStatus });
    } catch (error) {
        alert('خطا در بروزرسانی وضعیت: ' + error.message);
    }
};

// Logout
window.logout = async () => {
    if (confirm('آیا مطمئن هستید که می‌خواهید خارج شوید؟')) {
        try {
            await signOut(auth);
            location.replace('login.html');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
};

// Initial Load
document.addEventListener('DOMContentLoaded', async () => {
    await loadComponent('sidebar-container', 'components/sidebar.html');
    await loadComponent('header-container', 'components/header.html');

    document.getElementById('admin-email-display').innerText = ADMIN_CONFIG.adminEmail;

    // Default View
    window.navigateTo('Dashboard');
});
