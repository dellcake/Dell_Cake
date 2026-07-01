import { ADMIN_CONFIG } from "./config.js";
import { db } from "../../js/firebase-db.js";
import { auth } from "../../js/firebase-auth.js";
import { storage } from "../../js/firebase-storage.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    setDoc,
    query,
    orderBy,
    limit
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

// Courses State
let courses = [];
let filteredCourses = [];
let courseSearchQuery = '';
let courseFilterCategory = 'all';
let courseFilterStatus = 'all';
let coursePageSize = 5;
let courseCurrentPage = 1;

// Orders State
let orders = [];
let filteredOrders = [];
let orderSearchQuery = '';
let orderFilterStatus = 'all';
let orderSortOrder = 'newest';
let orderPageSize = 10;
let orderCurrentPage = 1;

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
    if (view === 'Dashboard') {
        loadDashboardData();
    } else if (view === 'Courses') {
        loadCourses();
    } else if (view === 'Orders') {
        loadOrders();
    } else if (view === 'Gallery') {
        loadGallery();
    } else if (view === 'Customers') {
        loadCustomers();
    } else if (view === 'Settings') {
        loadSettings();
    }
}

// Dashboard Data Implementation
async function loadDashboardData() {
    // 1. Load Statistics
    const unsubCourses = onSnapshot(collection(db, "courses"), (snapshot) => {
        const el = document.getElementById('total-courses-count');
        if (el) el.innerText = snapshot.size.toLocaleString('fa-IR');
    });
    unsubscribers.push(unsubCourses);

    const unsubOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Total Orders
        const totalEl = document.getElementById('total-orders-count');
        if (totalEl) totalEl.innerText = orders.length.toLocaleString('fa-IR');

        // Revenue Calculation
        const revenue = orders
            .filter(o => o.status === 'completed')
            .reduce((sum, o) => sum + (Number(o.price) || 0), 0);
        const revEl = document.getElementById('total-revenue');
        if (revEl) revEl.innerText = `${revenue.toLocaleString('fa-IR')} تومان`;

        // Recent Orders Table (Sorted by createdAt client-side to avoid index requirement errors)
        const tbody = document.getElementById('recent-orders-tbody');
        if (tbody) {
            const recent = orders
                .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
                .slice(0, 5);

            if (recent.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">سفارشی یافت نشد.</td></tr>';
            } else {
                tbody.innerHTML = recent.map(o => `
                    <tr>
                        <td>${o.customerName || 'نامشخص'}</td>
                        <td>${o.productName || 'محصول'}</td>
                        <td><span class="status-badge ${o.status}">${translateStatus(o.status)}</span></td>
                        <td>${(Number(o.price) || 0).toLocaleString('fa-IR')}</td>
                    </tr>
                `).join('');
            }
        }
    });
    unsubscribers.push(unsubOrders);

    // 2. Load Chart
    initDashboardChart();
}

async function initDashboardChart() {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;

    // Dynamically load Chart.js if not present
    if (typeof Chart === 'undefined') {
        await new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'],
            datasets: [{
                label: 'فروش ماهانه',
                data: [12, 19, 3, 5, 2, 3],
                borderColor: '#e8789a',
                backgroundColor: 'rgba(232, 120, 154, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Courses Logic
function loadCourses() {
    const unsub = onSnapshot(collection(db, "courses"), (snapshot) => {
        courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        applyCourseFilters();
    });
    unsubscribers.push(unsub);
}

window.handleCourseSearch = (query) => {
    courseSearchQuery = query.toLowerCase();
    courseCurrentPage = 1;
    applyCourseFilters();
};

window.handleCourseFilter = () => {
    courseFilterCategory = document.getElementById('filter-category').value;
    courseFilterStatus = document.getElementById('filter-status').value;
    courseCurrentPage = 1;
    applyCourseFilters();
};

function applyCourseFilters() {
    filteredCourses = courses.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(courseSearchQuery) ||
                            (c.description && c.description.toLowerCase().includes(courseSearchQuery));
        const matchesCategory = courseFilterCategory === 'all' || c.category === courseFilterCategory;
        const matchesStatus = courseFilterStatus === 'all' || c.status === courseFilterStatus;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    renderCourses();
}

function renderCourses() {
    const tbody = document.getElementById('courses-tbody');
    if (!tbody) return;

    // Pagination
    const totalItems = filteredCourses.length;
    const totalPages = Math.ceil(totalItems / coursePageSize);
    const start = (courseCurrentPage - 1) * coursePageSize;
    const end = start + coursePageSize;
    const paginatedItems = filteredCourses.slice(start, end);

    if (paginatedItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">دوره ای یافت نشد.</td></tr>';
    } else {
        tbody.innerHTML = paginatedItems.map(course => `
            <tr>
                <td><img src="${course.image || '../assets/placeholder.jpg'}" width="50" height="50" style="border-radius:8px; object-fit:cover;"></td>
                <td>${course.title}</td>
                <td>${Number(course.price).toLocaleString('fa-IR')} تومان</td>
                <td>${translateCategory(course.category)}</td>
                <td><span class="status-badge ${course.status || 'published'}">${translateStatus(course.status || 'published')}</span></td>
                <td>
                    <div class="actions">
                        <button class="btn-icon btn-edit" onclick="openCourseModal('${course.id}')"><i class="fa-solid fa-edit"></i></button>
                        <button class="btn-icon btn-delete" onclick="deleteCourse('${course.id}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Update Pagination UI
    const pageStartEl = document.getElementById('page-start');
    const pageEndEl = document.getElementById('page-end');
    const totalItemsEl = document.getElementById('total-items');
    const currentPageEl = document.getElementById('current-page');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    if (pageStartEl) pageStartEl.innerText = (totalItems > 0 ? start + 1 : 0).toLocaleString('fa-IR');
    if (pageEndEl) pageEndEl.innerText = Math.min(end, totalItems).toLocaleString('fa-IR');
    if (totalItemsEl) totalItemsEl.innerText = totalItems.toLocaleString('fa-IR');
    if (currentPageEl) currentPageEl.innerText = courseCurrentPage.toLocaleString('fa-IR');

    if (prevBtn) prevBtn.disabled = courseCurrentPage === 1;
    if (nextBtn) nextBtn.disabled = courseCurrentPage === totalPages || totalPages === 0;
}

window.changePage = (direction) => {
    courseCurrentPage += direction;
    renderCourses();
};

function translateCategory(cat) {
    const map = {
        'cake': 'کیک',
        'pastry': 'شیرینی',
        'dessert': 'دسر'
    };
    return map[cat] || cat;
}

window.openCourseModal = (courseId = null) => {
    const modal = document.getElementById('course-modal');
    const form = document.getElementById('course-form');
    if (!modal || !form) return;

    // Reset Tabs
    switchFormTab('basic');

    if (courseId) {
        const course = courses.find(c => c.id === courseId);
        form.courseId.value = course.id;
        form.title.value = course.title;
        form.slug.value = course.slug || '';
        form.category.value = course.category || 'cake';
        form.price.value = course.price;
        form.discount.value = course.discount || 0;
        form.level.value = course.level || 'intermediate';
        form.status.value = course.status || 'published';
        form.duration.value = course.duration || '';
        form.imageUrl.value = course.image || '';
        form.description.value = course.description || '';
        form.packageContent.value = Array.isArray(course.package) ? course.package.join('\n') : '';
        form.seoTitle.value = course.seoTitle || '';
        form.seoDescription.value = course.seoDescription || '';

        updateImagePreview(course.image);
        document.getElementById('modal-title').innerText = 'ویرایش دوره';
    } else {
        form.reset();
        form.courseId.value = '';
        updateImagePreview(null);
        document.getElementById('modal-title').innerText = 'افزودن دوره جدید';
    }
    modal.style.display = 'flex';
};

window.switchFormTab = (tabName) => {
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    document.getElementById(`tab-${tabName}`).classList.add('active');
    document.querySelector(`.tab-btn[onclick*="'${tabName}'"]`).classList.add('active');
};

window.previewCourseImage = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => updateImagePreview(e.target.result);
        reader.readAsDataURL(file);
    }
};

function updateImagePreview(src) {
    const preview = document.getElementById('image-preview');
    if (!preview) return;
    if (src) {
        preview.innerHTML = `<img src="${src}" style="width:100%; height:100%; object-fit:cover; border-radius:10px;">`;
    } else {
        preview.innerHTML = '<span>پیش‌نمایش تصویر</span>';
    }
}

async function uploadImage(file) {
    const storageRef = ref(storage, `courses/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
}

window.closeCourseModal = () => {
    document.getElementById('course-modal').style.display = 'none';
};

window.generateSlug = (text) => {
    const slug = text.toLowerCase()
        .replace(/[^\w\u0600-\u06FF\s-]/g, '') // Keep alphanumeric, persian chars, spaces, and hyphens
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    document.querySelector('input[name="slug"]').value = slug;
};

window.saveCourse = async (event) => {
    event.preventDefault();
    const form = event.target;
    const saveBtn = document.getElementById('save-course-btn');

    // Validation
    if (!form.title.value.trim()) return alert('لطفا عنوان دوره را وارد کنید');
    if (!form.slug.value.trim()) return alert('لطفا اسلاگ دوره را وارد کنید');

    saveBtn.disabled = true;
    saveBtn.innerText = 'در حال ذخیره...';

    try {
        let imageUrl = form.imageUrl.value;
        const imageFile = document.getElementById('course-image-input').files[0];

        if (imageFile) {
            imageUrl = await uploadImage(imageFile);
        }

        const courseData = {
            title: form.title.value.trim(),
            slug: form.slug.value.trim(),
            category: form.category.value,
            price: Number(form.price.value),
            discount: Number(form.discount.value) || 0,
            level: form.level.value,
            status: form.status.value,
            duration: form.duration.value.trim(),
            image: imageUrl,
            description: form.description.value.trim(),
            package: form.packageContent.value.split('\n').map(l => l.trim()).filter(l => l !== ''),
            seoTitle: form.seoTitle.value.trim(),
            seoDescription: form.seoDescription.value.trim(),
            updatedAt: new Date()
        };

        if (form.courseId.value) {
            await updateDoc(doc(db, "courses", form.courseId.value), courseData);
        } else {
            courseData.createdAt = new Date();
            await addDoc(collection(db, "courses"), courseData);
        }

        closeCourseModal();
    } catch (error) {
        console.error('Error saving course:', error);
        alert('خطا در ذخیره دوره: ' + error.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = 'ذخیره دوره';
    }
};

window.deleteCourse = async (id) => {
    if (confirm('آیا از حذف این دوره اطمینان دارید؟')) {
        await deleteDoc(doc(db, "courses", id));
    }
};

// Customers Logic
let customers = [];
let filteredCustomers = [];
let customerSearchQuery = '';
let customerFilterStatus = 'all';
let customerPageSize = 10;
let customerCurrentPage = 1;

function loadCustomers() {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
        customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        applyCustomerFilters();
    });
    unsubscribers.push(unsub);
}

window.handleCustomerSearch = (query) => {
    customerSearchQuery = query.toLowerCase();
    customerCurrentPage = 1;
    applyCustomerFilters();
};

window.handleCustomerFilter = () => {
    customerFilterStatus = document.getElementById('filter-customer-status').value;
    customerCurrentPage = 1;
    applyCustomerFilters();
};

function applyCustomerFilters() {
    filteredCustomers = customers.filter(c => {
        const matchesSearch = (c.displayName || '').toLowerCase().includes(customerSearchQuery) ||
                            (c.email || '').toLowerCase().includes(customerSearchQuery) ||
                            (c.phone || '').toLowerCase().includes(customerSearchQuery);
        const matchesStatus = customerFilterStatus === 'all' || (c.status || 'active') === customerFilterStatus;
        return matchesSearch && matchesStatus;
    });

    renderCustomers();
}

function renderCustomers() {
    const tbody = document.getElementById('customers-tbody');
    if (!tbody) return;

    const totalItems = filteredCustomers.length;
    const totalPages = Math.ceil(totalItems / customerPageSize);
    const start = (customerCurrentPage - 1) * customerPageSize;
    const end = start + customerPageSize;
    const paginatedItems = filteredCustomers.slice(start, end);

    if (paginatedItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">کاربری یافت نشد.</td></tr>';
    } else {
        tbody.innerHTML = paginatedItems.map(c => `
            <tr>
                <td>${c.displayName || 'نامشخص'}</td>
                <td>${c.email || 'بدون ایمیل'}</td>
                <td>${c.phone || 'ثبت نشده'}</td>
                <td>${c.createdAt ? new Date(c.createdAt.seconds * 1000).toLocaleDateString('fa-IR') : 'نامشخص'}</td>
                <td><span class="status-badge ${c.status || 'active'}">${(c.status || 'active') === 'active' ? 'فعال' : 'غیرفعال'}</span></td>
                <td>
                    <div class="actions">
                        <button class="btn-icon btn-edit" title="ویرایش" onclick="alert('ویرایش کاربر بزودی...')"><i class="fa-solid fa-user-pen"></i></button>
                        <button class="btn-icon btn-delete" title="غیرفعال‌سازی" onclick="toggleUserStatus('${c.id}', '${c.status || 'active'}')"><i class="fa-solid fa-user-slash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Update Pagination UI
    const pageStartEl = document.getElementById('customer-page-start');
    const pageEndEl = document.getElementById('customer-page-end');
    const totalItemsEl = document.getElementById('customer-total-items');
    const currentPageEl = document.getElementById('customer-current-page');
    const prevBtn = document.getElementById('customer-prev-page');
    const nextBtn = document.getElementById('customer-next-page');

    if (pageStartEl) pageStartEl.innerText = (totalItems > 0 ? start + 1 : 0).toLocaleString('fa-IR');
    if (pageEndEl) pageEndEl.innerText = Math.min(end, totalItems).toLocaleString('fa-IR');
    if (totalItemsEl) totalItemsEl.innerText = totalItems.toLocaleString('fa-IR');
    if (currentPageEl) currentPageEl.innerText = customerCurrentPage.toLocaleString('fa-IR');

    if (prevBtn) prevBtn.disabled = customerCurrentPage === 1;
    if (nextBtn) nextBtn.disabled = customerCurrentPage === totalPages || totalPages === 0;
}

window.changeCustomerPage = (direction) => {
    customerCurrentPage += direction;
    renderCustomers();
};

window.toggleUserStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    if (confirm(`آیا از ${newStatus === 'active' ? 'فعال‌سازی' : 'غیرفعال‌سازی'} این کاربر اطمینان دارید؟`)) {
        try {
            await updateDoc(doc(db, "users", id), { status: newStatus });
        } catch (error) {
            alert('خطا در بروزرسانی وضعیت: ' + error.message);
        }
    }
};

// Settings Logic
async function loadSettings() {
    const form = document.getElementById('settings-form');
    if (!form) return;

    try {
        const docRef = doc(db, "settings", "site");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            Object.keys(data).forEach(key => {
                if (form[key]) {
                    form[key].value = data[key];
                }
            });
            if (data.logoUrl) {
                updateSettingsLogoPreview(data.logoUrl);
            }
        }
    } catch (error) {
        console.error("Error loading settings:", error);
    }
}

window.switchSettingsTab = (tabName) => {
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    document.getElementById(`tab-${tabName}`).classList.add('active');
    document.querySelector(`.tab-btn[onclick*="'${tabName}'"]`).classList.add('active');
};

window.previewSiteLogo = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => updateSettingsLogoPreview(e.target.result);
        reader.readAsDataURL(file);
    }
};

function updateSettingsLogoPreview(src) {
    const preview = document.getElementById('settings-logo-preview');
    if (preview) {
        preview.innerHTML = `<img src="${src}" alt="Logo">`;
    }
}

window.saveSiteSettings = async () => {
    const form = document.getElementById('settings-form');
    const saveBtn = document.querySelector('.add-btn[onclick="saveSiteSettings()"]');

    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> در حال ذخیره...';

    try {
        const formData = new FormData(form);
        const settingsData = {};
        formData.forEach((value, key) => {
            settingsData[key] = value;
        });

        // Handle Logo Upload
        const logoFile = document.getElementById('site-logo-input').files[0];
        if (logoFile) {
            const storageRef = ref(storage, `site/logo_${Date.now()}`);
            const snapshot = await uploadBytes(storageRef, logoFile);
            settingsData.logoUrl = await getDownloadURL(snapshot.ref);
        }

        await setDoc(doc(db, "settings", "site"), settingsData, { merge: true });
        alert('تنظیمات با موفقیت ذخیره شد');
    } catch (error) {
        console.error("Error saving settings:", error);
        alert('خطا در ذخیره تنظیمات: ' + error.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> ذخیره تغییرات';
    }
};

window.exportCustomersToCSV = () => {
    if (filteredCustomers.length === 0) return alert('لیست کاربران خالی است');
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "نام,ایمیل,تلفن,تاریخ عضویت,وضعیت\n";
    filteredCustomers.forEach(c => {
        const row = [
            c.displayName || 'نامشخص',
            c.email || '',
            c.phone || '',
            c.createdAt ? new Date(c.createdAt.seconds * 1000).toLocaleDateString('fa-IR') : '',
            (c.status || 'active') === 'active' ? 'فعال' : 'غیرفعال'
        ].join(",");
        csvContent += row + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `delcake-customers.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Gallery Logic
let galleryItems = [];
let galleryFilter = 'all';

function loadGallery() {
    const unsub = onSnapshot(collection(db, "gallery"), (snapshot) => {
        galleryItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderGallery();
    });
    unsubscribers.push(unsub);
}

window.previewGalleryImage = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('gallery-upload-preview');
            const container = document.getElementById('gallery-preview-container');
            if (preview && container) {
                preview.src = e.target.result;
                container.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }
};

window.clearGalleryPreview = () => {
    const input = document.getElementById('gallery-file-input');
    const container = document.getElementById('gallery-preview-container');
    if (input) input.value = '';
    if (container) container.style.display = 'none';
};

window.handleGalleryUpload = async () => {
    const fileInput = document.getElementById('gallery-file-input');
    const categorySelect = document.getElementById('gallery-upload-category');
    const uploadBtn = document.getElementById('upload-gallery-btn');

    if (!fileInput.files[0]) return alert('لطفا یک تصویر انتخاب کنید');

    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> در حال پردازش...';

    try {
        const file = fileInput.files[0];
        const watermarkedBlob = await watermarkImage(file);

        const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, watermarkedBlob);
        const downloadURL = await getDownloadURL(snapshot.ref);

        await addDoc(collection(db, "gallery"), {
            url: downloadURL,
            category: categorySelect.value,
            createdAt: new Date()
        });

        clearGalleryPreview();
        alert('تصویر با موفقیت آپلود شد');
    } catch (error) {
        console.error('Upload error:', error);
        alert('خطا در آپلود تصویر: ' + error.message);
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '<i class="fa-solid fa-upload"></i> آپلود تصویر';
    }
};

async function watermarkImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Set canvas size to image size
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw original image
                ctx.drawImage(img, 0, 0);

                // Watermark settings
                const fontSize = Math.max(20, canvas.width / 20);
                ctx.font = `bold ${fontSize}px Lalezar, Tahoma`;
                ctx.fillStyle = 'rgba(232, 120, 154, 0.5)'; // Pink with transparency
                ctx.textAlign = 'right';
                ctx.textBaseline = 'bottom';

                // Add shadow for better visibility
                ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;

                // Draw text
                ctx.fillText('Dell Cake | دل کیک', canvas.width - 20, canvas.height - 20);

                canvas.toBlob((blob) => {
                    resolve(blob);
                }, file.type);
            };
            img.src = event.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

window.filterGallery = (category) => {
    galleryFilter = category;

    // Update UI
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(`'${category}'`)) {
            btn.classList.add('active');
        }
    });

    renderGallery();
};

function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    const filtered = galleryItems.filter(item =>
        galleryFilter === 'all' || item.category === galleryFilter
    );

    if (filtered.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 50px;">تصویری در این دسته بندی یافت نشد.</div>';
    } else {
        grid.innerHTML = filtered.map(item => `
            <div class="gallery-item">
                <span class="category-badge">${translateGalleryCategory(item.category)}</span>
                <img src="${item.url}" onclick="openLightbox('${item.url}', '${translateGalleryCategory(item.category)}')">
                <div class="gallery-item-overlay">
                    <button class="btn-delete-image" onclick="deleteGalleryItem('${item.id}', '${item.url}')">
                        <i class="fa-solid fa-trash"></i> حذف
                    </button>
                </div>
            </div>
        `).join('');
    }
}

function translateGalleryCategory(cat) {
    const map = {
        'cake': 'کیک',
        'pastry': 'شیرینی',
        'cafe-cake': 'کیک کافه‌ای',
        'cupcake': 'کاپ کیک',
        'other': 'سایر'
    };
    return map[cat] || cat;
}

window.deleteGalleryItem = async (id, url) => {
    if (!confirm('آیا از حذف این تصویر اطمینان دارید؟')) return;

    try {
        await deleteDoc(doc(db, "gallery", id));
        // Note: Realistically we should also delete from storage,
        // but it requires matching the URL to a path. For simplicity now we just remove Firestore record.
        // If we want to delete from storage:
        // const imageRef = ref(storage, url);
        // await deleteObject(imageRef);
    } catch (error) {
        alert('خطا در حذف تصویر: ' + error.message);
    }
};

window.openLightbox = (url, caption) => {
    const modal = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const cap = document.getElementById('lightbox-caption');

    if (modal && img && cap) {
        img.src = url;
        cap.innerText = caption;
        modal.style.display = 'block';
    }
};

window.closeLightbox = () => {
    document.getElementById('lightbox').style.display = 'none';
};

// Orders Logic
function loadOrders() {
    const unsub = onSnapshot(collection(db, "orders"), (snapshot) => {
        orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        applyOrderFilters();
    });
    unsubscribers.push(unsub);
}

window.handleOrderSearch = (query) => {
    orderSearchQuery = query.toLowerCase();
    orderCurrentPage = 1;
    applyOrderFilters();
};

window.handleOrderFilter = () => {
    orderFilterStatus = document.getElementById('filter-order-status').value;
    orderSortOrder = document.getElementById('sort-orders').value;
    orderCurrentPage = 1;
    applyOrderFilters();
};

function applyOrderFilters() {
    filteredOrders = orders.filter(o => {
        const matchesSearch = (o.customerName || '').toLowerCase().includes(orderSearchQuery) ||
                            (o.id || '').toLowerCase().includes(orderSearchQuery) ||
                            (o.productName || '').toLowerCase().includes(orderSearchQuery);
        const matchesStatus = orderFilterStatus === 'all' || o.status === orderFilterStatus;
        return matchesSearch && matchesStatus;
    });

    // Sorting
    filteredOrders.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        const priceA = Number(a.price) || 0;
        const priceB = Number(b.price) || 0;

        if (orderSortOrder === 'newest') return timeB - timeA;
        if (orderSortOrder === 'oldest') return timeA - timeB;
        if (orderSortOrder === 'price-high') return priceB - priceA;
        if (orderSortOrder === 'price-low') return priceA - priceB;
        return 0;
    });

    renderOrders();
}

function renderOrders() {
    const tbody = document.getElementById('orders-tbody');
    if (!tbody) return;

    // Pagination
    const totalItems = filteredOrders.length;
    const totalPages = Math.ceil(totalItems / orderPageSize);
    const start = (orderCurrentPage - 1) * orderPageSize;
    const end = start + orderPageSize;
    const paginatedItems = filteredOrders.slice(start, end);

    if (paginatedItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">سفارشی یافت نشد.</td></tr>';
    } else {
        tbody.innerHTML = paginatedItems.map(order => `
            <tr>
                <td>#${order.id.slice(-6).toUpperCase()}</td>
                <td>${order.customerName || 'نامشخص'}</td>
                <td>${order.productName || 'محصول'}</td>
                <td>${(Number(order.price) || 0).toLocaleString('fa-IR')}</td>
                <td>${order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('fa-IR') : 'نامشخص'}</td>
                <td><span class="status-badge ${order.status}">${translateStatus(order.status)}</span></td>
                <td>
                    <div class="actions">
                        <button class="btn-icon btn-edit" title="جزئیات" onclick="openOrderModal('${order.id}')"><i class="fa-solid fa-eye"></i></button>
                        <select onchange="updateOrderStatus('${order.id}', this.value)" class="status-select-mini">
                            <option value="new" ${order.status === 'new' ? 'selected' : ''}>جدید</option>
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>در حال بررسی</option>
                            <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>آماده‌سازی</option>
                            <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>آماده تحویل</option>
                            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>تحویل شده</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>لغو شده</option>
                        </select>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Update Pagination UI
    const pageStartEl = document.getElementById('order-page-start');
    const pageEndEl = document.getElementById('order-page-end');
    const totalItemsEl = document.getElementById('order-total-items');
    const currentPageEl = document.getElementById('order-current-page');
    const prevBtn = document.getElementById('order-prev-page');
    const nextBtn = document.getElementById('order-next-page');

    if (pageStartEl) pageStartEl.innerText = (totalItems > 0 ? start + 1 : 0).toLocaleString('fa-IR');
    if (pageEndEl) pageEndEl.innerText = Math.min(end, totalItems).toLocaleString('fa-IR');
    if (totalItemsEl) totalItemsEl.innerText = totalItems.toLocaleString('fa-IR');
    if (currentPageEl) currentPageEl.innerText = orderCurrentPage.toLocaleString('fa-IR');

    if (prevBtn) prevBtn.disabled = orderCurrentPage === 1;
    if (nextBtn) nextBtn.disabled = orderCurrentPage === totalPages || totalPages === 0;
}

window.changeOrderPage = (direction) => {
    orderCurrentPage += direction;
    renderOrders();
};

window.openOrderModal = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const modal = document.getElementById('order-modal');
    const content = document.getElementById('order-details-content');

    content.innerHTML = `
        <div class="detail-item">
            <label>شناسه سفارش</label>
            <span>#${order.id.toUpperCase()}</span>
        </div>
        <div class="detail-item">
            <label>تاریخ ثبت</label>
            <span>${order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleString('fa-IR') : 'نامشخص'}</span>
        </div>
        <div class="detail-item">
            <label>نام مشتری</label>
            <span>${order.customerName || 'نامشخص'}</span>
        </div>
        <div class="detail-item">
            <label>شماره تماس</label>
            <span>${order.phone || 'نامشخص'}</span>
        </div>
        <div class="detail-item">
            <label>محصول/دوره</label>
            <span>${order.productName || 'نامشخص'}</span>
        </div>
        <div class="detail-item">
            <label>مبلغ کل</label>
            <span>${(Number(order.price) || 0).toLocaleString('fa-IR')} تومان</span>
        </div>
        <div class="detail-item order-full-width">
            <label>آدرس تحویل / توضیحات</label>
            <span>${order.address || 'ثبت نشده'}</span>
        </div>
        <div class="detail-item">
            <label>وضعیت فعلی</label>
            <span class="status-badge ${order.status}">${translateStatus(order.status)}</span>
        </div>
    `;

    modal.style.display = 'flex';
};

window.closeOrderModal = () => {
    document.getElementById('order-modal').style.display = 'none';
};

window.printOrder = () => {
    window.print();
};

window.exportOrdersToCSV = () => {
    if (filteredOrders.length === 0) return alert('لیست سفارشات خالی است');

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Added BOM for Excel Persian support
    csvContent += "شناسه سفارش,نام مشتری,محصول,قیمت,تاریخ,وضعیت\n";

    filteredOrders.forEach(o => {
        const row = [
            o.id,
            o.customerName || 'نامشخص',
            o.productName || 'نامشخص',
            o.price || 0,
            o.createdAt ? new Date(o.createdAt.seconds * 1000).toLocaleDateString('fa-IR') : 'نامشخص',
            translateStatus(o.status)
        ].join(",");
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `delcake-orders-${new Date().toLocaleDateString('fa-IR')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

function translateStatus(status) {
    const map = {
        'new': 'جدید',
        'pending': 'در حال بررسی',
        'preparing': 'آماده‌سازی',
        'ready': 'آماده تحویل',
        'completed': 'تحویل شده',
        'cancelled': 'لغو شده',
        'published': 'منتشر شده',
        'draft': 'پیش‌نویس'
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
