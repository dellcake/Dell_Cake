import { ADMIN_CONFIG } from "./config.js";
import { supabase } from "../../js/supabase-client.js";
import { signOut as supabaseSignOut, updatePassword, updateProfile as supabaseUpdateProfile } from "../../js/supabase-auth.js";
import { loadDashboardData } from "./modules/dashboard.js";

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

// Blog State
let blogPosts = [];
let filteredBlog = [];
let blogSearchQuery = '';
let blogFilterStatus = 'all';

// Messages State
let contactMessages = [];
let filteredMessages = [];
let messageSearchQuery = '';
let messageFilterStatus = 'all';
let currentMessageId = null;

async function clearListeners() {
    for (const unsub of unsubscribers) {
        if (typeof unsub === 'function') {
            await unsub();
        }
    }
    unsubscribers = [];
}

// Navigation Logic
window.navigateTo = async (viewName) => {
    currentView = viewName;
    clearListeners();
    const mainView = document.getElementById('main-view');

    // Only show full-page loader if NOT navigating to dashboard (it has skeletons)
    if (viewName !== 'Dashboard') {
        mainView.innerHTML = '<div class="loader-wrapper"><div class="loader"></div></div>';
    } else {
        mainView.innerHTML = ''; // Clear for dashboard to load its own template
    }

    // Update active state in sidebar
    document.querySelectorAll('.sidebar-nav li').forEach(li => {
        li.classList.remove('active');
        if (li.dataset.page === viewName.toLowerCase()) {
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
        loadDashboardData(unsubscribers);
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
    } else if (view === 'Blog') {
        loadBlog();
    } else if (view === 'Messages') {
        loadMessages();
    } else if (view === 'Profile') {
        loadProfile();
    } else if (view === 'Products') {
        loadProducts();
    } else if (view === 'Banners') {
        loadBanners();
    } else if (view === 'Discounts') {
        loadDiscounts();
    }
}

// Courses Logic
async function loadCourses() {
    const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching courses:', error);
        return;
    }

    courses = data.map(item => ({
        ...item,
        image: item.image_url,
        package: item.package_content,
        seoTitle: item.seo_title,
        seoDescription: item.seo_description
    }));
    applyCourseFilters();

    // Subscribe to changes
    const sub = supabase
        .channel('admin-courses')
        .on('postgres_changes', { event: '*', table: 'courses' }, async () => {
            const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
            courses = data.map(item => ({
                ...item,
                image: item.image_url,
                package: item.package_content,
                seoTitle: item.seo_title,
                seoDescription: item.seo_description
            }));
            applyCourseFilters();
        })
        .subscribe();

    unsubscribers.push(() => supabase.removeChannel(sub));
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
                <td><img src="${course.image || '../images/logo/sweet-.png'}" width="50" height="50" style="border-radius:8px; object-fit:cover; opacity: 0.5;"></td>
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

async function uploadImage(file, bucket = 'courses') {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

    return publicUrl;
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
            image_url: imageUrl,
            description: form.description.value.trim(),
            package_content: form.packageContent.value.split('\n').map(l => l.trim()).filter(l => l !== ''),
            seo_title: form.seoTitle.value.trim(),
            seo_description: form.seoDescription.value.trim(),
            updated_at: new Date().toISOString()
        };

        if (form.courseId.value) {
            const { error } = await supabase
                .from('courses')
                .update(courseData)
                .eq('id', form.courseId.value);
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('courses')
                .insert([{ ...courseData, created_at: new Date().toISOString() }]);
            if (error) throw error;
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
    if (!confirm('آیا از حذف این دوره اطمینان دارید؟')) return;

    try {
        // 1. Get course data to find image URL
        const { data: course, error: fetchError } = await supabase
            .from('courses')
            .select('image_url')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        // 2. Delete image from storage if it exists
        if (course && course.image_url && course.image_url.includes('/storage/v1/object/public/courses/')) {
            const path = course.image_url.split('/courses/').pop();
            await supabase.storage.from('courses').remove([path]);
        }

        // 3. Delete from database
        const { error: deleteError } = await supabase
            .from('courses')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        renderCourses(); // Refresh list
    } catch (error) {
        console.error('Error deleting course:', error);
        alert('خطا در حذف دوره: ' + error.message);
    }
};

// Customers Logic
let customers = [];
let filteredCustomers = [];
let customerSearchQuery = '';
let customerFilterStatus = 'all';
let customerPageSize = 10;
let customerCurrentPage = 1;

async function loadCustomers() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching customers:', error);
        return;
    }

    customers = data.map(item => ({
        ...item,
        displayName: item.full_name || item.email.split('@')[0]
    }));
    applyCustomerFilters();

    // Subscribe
    const sub = supabase
        .channel('admin-profiles')
        .on('postgres_changes', { event: '*', table: 'profiles' }, async () => {
            const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
            customers = data.map(item => ({
                ...item,
                displayName: item.full_name || item.email.split('@')[0]
            }));
            applyCustomerFilters();
        })
        .subscribe();

    unsubscribers.push(() => supabase.removeChannel(sub));
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
                <td>${c.created_at ? new Date(c.created_at).toLocaleDateString('fa-IR') : 'نامشخص'}</td>
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
            const { error } = await supabase
                .from('profiles')
                .update({ status: newStatus })
                .eq('id', id);
            if (error) throw error;
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
        const { data, error } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'site_config')
            .single();

        if (data && data.value) {
            const config = data.value;
            Object.keys(config).forEach(key => {
                if (form[key]) {
                    form[key].value = config[key];
                }
            });
            if (config.logoUrl) {
                updateSettingsLogoPreview(config.logoUrl);
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
            settingsData.logoUrl = await uploadImage(logoFile, 'site');
        }

        const { error } = await supabase
            .from('site_settings')
            .upsert({
                key: 'site_config',
                value: settingsData,
                updated_at: new Date().toISOString()
            });

        if (error) throw error;
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
            c.created_at ? new Date(c.created_at).toLocaleDateString('fa-IR') : '',
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

async function loadGallery() {
    const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching gallery:', error);
        return;
    }

    galleryItems = data;
    renderGallery();

    // Subscribe
    const sub = supabase
        .channel('admin-gallery')
        .on('postgres_changes', { event: '*', table: 'gallery' }, async () => {
            const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
            galleryItems = data;
            renderGallery();
        })
        .subscribe();

    unsubscribers.push(() => supabase.removeChannel(sub));
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

        // Convert Blob to File object for Supabase
        const watermarkedFile = new File([watermarkedBlob], file.name, { type: file.type });
        const downloadURL = await uploadImage(watermarkedFile, 'gallery');

        const { error } = await supabase
            .from('gallery')
            .insert([{
                url: downloadURL,
                category: categorySelect.value,
                created_at: new Date().toISOString()
            }]);

        if (error) throw error;

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
                ctx.fillText('Dell Cake | دل‌کیک', canvas.width - 20, canvas.height - 20);

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
        const { error } = await supabase
            .from('gallery')
            .delete()
            .eq('id', id);

        if (error) throw error;

        // Try to delete from storage if URL is from our Supabase bucket
        if (url.includes('/storage/v1/object/public/gallery/')) {
            const path = url.split('/gallery/').pop();
            await supabase.storage.from('gallery').remove([path]);
        }
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
async function loadOrders() {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching orders:', error);
        return;
    }

    orders = data.map(item => ({
        ...item,
        customerName: item.customer_name,
        productName: item.product_name
    }));
    applyOrderFilters();

    // Subscribe
    const sub = supabase
        .channel('admin-orders')
        .on('postgres_changes', { event: '*', table: 'orders' }, async () => {
            const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
            orders = data.map(item => ({
                ...item,
                customerName: item.customer_name,
                productName: item.product_name
            }));
            applyOrderFilters();
        })
        .subscribe();

    unsubscribers.push(() => supabase.removeChannel(sub));
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
        const timeA = new Date(a.created_at).getTime() || 0;
        const timeB = new Date(b.created_at).getTime() || 0;
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
                <td>${order.created_at ? new Date(order.created_at).toLocaleDateString('fa-IR') : 'نامشخص'}</td>
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
            <span>${order.created_at ? new Date(order.created_at).toLocaleString('fa-IR') : 'نامشخص'}</span>
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
            o.created_at ? new Date(o.created_at).toLocaleDateString('fa-IR') : 'نامشخص',
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
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', id);
        if (error) throw error;
    } catch (error) {
        alert('خطا در بروزرسانی وضعیت: ' + error.message);
    }
};

// Blog Logic
async function loadBlog() {
    const { data, error } = await supabase
        .from('blog')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching blog:', error);
        return;
    }

    blogPosts = data;
    applyBlogFilters();

    // Subscribe
    const sub = supabase
        .channel('admin-blog')
        .on('postgres_changes', { event: '*', table: 'blog' }, async () => {
            const { data } = await supabase.from('blog').select('*').order('created_at', { ascending: false });
            blogPosts = data;
            applyBlogFilters();
        })
        .subscribe();

    unsubscribers.push(() => supabase.removeChannel(sub));
}

window.handleBlogSearch = (query) => {
    blogSearchQuery = query.toLowerCase();
    applyBlogFilters();
};

window.handleBlogFilter = () => {
    blogFilterStatus = document.getElementById('filter-blog-status').value;
    applyBlogFilters();
};

function applyBlogFilters() {
    filteredBlog = blogPosts.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(blogSearchQuery) ||
                            (p.excerpt && p.excerpt.toLowerCase().includes(blogSearchQuery));
        const matchesStatus = blogFilterStatus === 'all' || p.status === blogFilterStatus;
        return matchesSearch && matchesStatus;
    });
    renderBlog();
}

function renderBlog() {
    const tbody = document.getElementById('blog-tbody');
    if (!tbody) return;

    if (filteredBlog.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">مقاله‌ای یافت نشد.</td></tr>';
    } else {
        tbody.innerHTML = filteredBlog.map(post => `
            <tr>
                <td><img src="${post.image_url || '../images/logo/sweet-.png'}" width="50" height="50" style="border-radius:8px; object-fit:cover; opacity: 0.5;"></td>
                <td>${post.title}</td>
                <td>${post.author_name || 'مدیریت'}</td>
                <td>${new Date(post.created_at).toLocaleDateString('fa-IR')}</td>
                <td><span class="status-badge ${post.status}">${translateStatus(post.status)}</span></td>
                <td>
                    <div class="actions">
                        <button class="btn-icon btn-edit" onclick="openBlogModal('${post.id}')"><i class="fa-solid fa-edit"></i></button>
                        <button class="btn-icon btn-delete" onclick="deleteBlogPost('${post.id}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

window.openBlogModal = (id = null) => {
    const modal = document.getElementById('blog-modal');
    const form = document.getElementById('blog-form');
    if (!modal || !form) return;

    if (id) {
        const post = blogPosts.find(p => p.id === id);
        form.blogId.value = post.id;
        form.title.value = post.title;
        form.slug.value = post.slug;
        form.author.value = post.author_name;
        form.status.value = post.status;
        form.excerpt.value = post.excerpt || '';
        form.content.value = post.content || '';
        form.imageUrl.value = post.image_url || '';
        updateBlogImagePreview(post.image_url);
        document.getElementById('blog-modal-title').innerText = 'ویرایش مقاله';
    } else {
        form.reset();
        form.blogId.value = '';
        form.imageUrl.value = '';
        updateBlogImagePreview(null);
        document.getElementById('blog-modal-title').innerText = 'افزودن مقاله جدید';
    }
    modal.style.display = 'flex';
};

window.closeBlogModal = () => {
    document.getElementById('blog-modal').style.display = 'none';
};

window.generateBlogSlug = (text) => {
    const slug = text.toLowerCase()
        .replace(/[^\w\u0600-\u06FF\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    document.querySelector('#blog-form input[name="slug"]').value = slug;
};

window.previewBlogImage = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => updateBlogImagePreview(e.target.result);
        reader.readAsDataURL(file);
    }
};

function updateBlogImagePreview(src) {
    const preview = document.getElementById('blog-image-preview');
    if (!preview) return;
    if (src) {
        preview.innerHTML = `<img src="${src}" style="width:100%; height:100%; object-fit:cover; border-radius:10px;">`;
    } else {
        preview.innerHTML = '<span>انتخاب تصویر</span>';
    }
}

window.saveBlogPost = async (event) => {
    event.preventDefault();
    const form = event.target;
    const saveBtn = document.getElementById('save-blog-btn');

    saveBtn.disabled = true;
    saveBtn.innerText = 'در حال ذخیره...';

    try {
        let imageUrl = form.imageUrl.value;
        const imageFile = document.getElementById('blog-image-input').files[0];

        if (imageFile) {
            imageUrl = await uploadImage(imageFile, 'blog');
        }

        const blogData = {
            title: form.title.value.trim(),
            slug: form.slug.value.trim(),
            author_name: form.author.value.trim(),
            status: form.status.value,
            excerpt: form.excerpt.value.trim(),
            content: form.content.value.trim(),
            image_url: imageUrl,
            updated_at: new Date().toISOString()
        };

        if (form.blogId.value) {
            const { error } = await supabase
                .from('blog')
                .update(blogData)
                .eq('id', form.blogId.value);
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('blog')
                .insert([{ ...blogData, created_at: new Date().toISOString() }]);
            if (error) throw error;
        }

        closeBlogModal();
    } catch (error) {
        console.error('Error saving blog post:', error);
        alert('خطا در ذخیره مقاله: ' + error.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = 'ذخیره مقاله';
    }
};

window.deleteBlogPost = async (id) => {
    if (!confirm('آیا از حذف این مقاله اطمینان دارید؟')) return;

    try {
        const { data: post } = await supabase.from('blog').select('image_url').eq('id', id).single();

        if (post && post.image_url && post.image_url.includes('/storage/v1/object/public/blog/')) {
            const path = post.image_url.split('/blog/').pop();
            await supabase.storage.from('blog').remove([path]);
        }

        const { error } = await supabase.from('blog').delete().eq('id', id);
        if (error) throw error;
    } catch (error) {
        alert('خطا در حذف مقاله: ' + error.message);
    }
};

// Messages Logic
async function loadMessages() {
    const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching messages:', error);
        return;
    }

    contactMessages = data;
    applyMessageFilters();

    // Subscribe
    const sub = supabase
        .channel('admin-messages')
        .on('postgres_changes', { event: '*', table: 'contact_messages' }, async () => {
            const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
            contactMessages = data;
            applyMessageFilters();
        })
        .subscribe();

    unsubscribers.push(() => supabase.removeChannel(sub));
}

window.handleMessageSearch = (query) => {
    messageSearchQuery = query.toLowerCase();
    applyMessageFilters();
};

window.handleMessageFilter = () => {
    messageFilterStatus = document.getElementById('filter-message-status').value;
    applyMessageFilters();
};

function applyMessageFilters() {
    filteredMessages = contactMessages.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(messageSearchQuery) ||
                            (m.subject && m.subject.toLowerCase().includes(messageSearchQuery)) ||
                            m.message.toLowerCase().includes(messageSearchQuery);
        const matchesStatus = messageFilterStatus === 'all' || m.status === messageFilterStatus;
        return matchesSearch && matchesStatus;
    });
    renderMessages();
}

function renderMessages() {
    const list = document.getElementById('messages-list');
    if (!list) return;

    if (filteredMessages.length === 0) {
        list.innerHTML = '<div class="card" style="text-align:center; padding:40px;">پیامی یافت نشد.</div>';
    } else {
        list.innerHTML = filteredMessages.map(msg => `
            <div class="message-card ${msg.status}" onclick="openMessageModal('${msg.id}')">
                <div class="msg-info">
                    <h4>${msg.name}</h4>
                    <p>${msg.subject || 'بدون موضوع'}</p>
                </div>
                <div class="msg-meta">
                    <span class="msg-date">${new Date(msg.created_at).toLocaleString('fa-IR')}</span>
                    <span class="status-badge ${msg.status}">${translateMessageStatus(msg.status)}</span>
                </div>
            </div>
        `).join('');
    }
}

function translateMessageStatus(status) {
    const map = {
        'unread': 'خوانده نشده',
        'read': 'خوانده شده',
        'replied': 'پاسخ داده شده'
    };
    return map[status] || status;
}

window.openMessageModal = async (id) => {
    const msg = contactMessages.find(m => m.id === id);
    if (!msg) return;

    currentMessageId = id;
    const modal = document.getElementById('message-modal');
    const content = document.getElementById('message-detail-content');

    content.innerHTML = `
        <div class="detail-item">
            <label>فرستنده</label>
            <span>${msg.name}</span>
        </div>
        <div class="detail-item">
            <label>ایمیل / تماس</label>
            <span>${msg.email || ''} ${msg.phone || ''}</span>
        </div>
        <div class="detail-item">
            <label>موضوع</label>
            <span>${msg.subject || 'بدون موضوع'}</span>
        </div>
        <div class="detail-item">
            <label>تاریخ ارسال</label>
            <span>${new Date(msg.created_at).toLocaleString('fa-IR')}</span>
        </div>
        <div class="detail-item order-full-width">
            <label>متن پیام</label>
            <div style="background:#f9f9f9; padding:15px; border-radius:10px; margin-top:10px; white-space:pre-wrap;">${msg.message}</div>
        </div>
    `;

    document.getElementById('update-message-status').value = msg.status;
    modal.style.display = 'flex';

    // Auto-mark as read if unread
    if (msg.status === 'unread') {
        await updateCurrentMessageStatus('read');
    }
};

window.closeMessageModal = () => {
    document.getElementById('message-modal').style.display = 'none';
};

window.updateCurrentMessageStatus = async (newStatus) => {
    if (!currentMessageId) return;
    try {
        const { error } = await supabase
            .from('contact_messages')
            .update({ status: newStatus })
            .eq('id', currentMessageId);
        if (error) throw error;
    } catch (error) {
        console.error('Error updating message status:', error);
    }
};

window.deleteCurrentMessage = async () => {
    if (!currentMessageId || !confirm('آیا از حذف این پیام اطمینان دارید؟')) return;
    try {
        const { error } = await supabase
            .from('contact_messages')
            .delete()
            .eq('id', currentMessageId);
        if (error) throw error;
        closeMessageModal();
    } catch (error) {
        alert('خطا در حذف پیام: ' + error.message);
    }
};

// Profile Logic
async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    const form = document.getElementById('profile-form');
    if (form && profile) {
        form.email.value = profile.email;
        form.displayName.value = profile.full_name || '';
        form.phone.value = profile.phone || '';
    }
}

window.saveAdminProfile = async (event) => {
    event.preventDefault();
    const form = event.target;
    const saveBtn = form.querySelector('button[type="submit"]');

    const fullName = form.displayName.value.trim();
    const phone = form.phone.value.trim();

    saveBtn.disabled = true;
    saveBtn.innerText = 'در حال بروزرسانی...';

    try {
        const { data: { user } } = await supabase.auth.getUser();

        // 1. Update Auth
        const { error: authError } = await supabaseUpdateProfile({
            data: {
                display_name: fullName,
                phone: phone
            }
        });
        if (authError) throw authError;

        // 2. Update profiles table
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                full_name: fullName,
                phone: phone,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

        if (profileError) throw profileError;

        alert('پروفایل با موفقیت بروزرسانی شد');
    } catch (error) {
        alert('خطا در بروزرسانی پروفایل: ' + error.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = 'بروزرسانی مشخصات';
    }
};

window.changeAdminPassword = async (event) => {
    event.preventDefault();
    const form = event.target;
    const saveBtn = form.querySelector('button[type="submit"]');

    if (form.newPassword.value !== form.confirmPassword.value) {
        return alert('رمز عبور جدید و تکرار آن مطابقت ندارند');
    }

    saveBtn.disabled = true;
    saveBtn.innerText = 'در حال تغییر رمز...';

    try {
        const { error } = await updatePassword(form.newPassword.value);
        if (error) throw error;
        alert('رمز عبور با موفقیت تغییر کرد');
        form.reset();
    } catch (error) {
        alert('خطا در تغییر رمز عبور: ' + error.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = 'تغییر رمز عبور';
    }
};

// Products Logic
let products = [];

async function loadProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    products = data;
    renderProducts();

    const sub = supabase
        .channel('admin-products')
        .on('postgres_changes', { event: '*', table: 'products' }, async () => {
            const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
            products = data;
            renderProducts();
        })
        .subscribe();

    unsubscribers.push(() => supabase.removeChannel(sub));
}

function renderProducts() {
    const tbody = document.getElementById('products-tbody');
    if (!tbody) return;

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">محصولی یافت نشد.</td></tr>';
    } else {
        tbody.innerHTML = products.map(p => `
            <tr>
                <td><img src="${p.image_url || '../images/logo/sweet-.png'}" width="50" height="50" style="border-radius:8px; object-fit:cover; opacity: 0.5;"></td>
                <td>${p.name}</td>
                <td>${(Number(p.price) || 0).toLocaleString('fa-IR')} تومان</td>
                <td>${translateCategory(p.category)}</td>
                <td><span class="status-badge ${p.status || 'active'}">${p.status === 'active' ? 'فعال' : 'غیرفعال'}</span></td>
                <td>
                    <div class="actions">
                        <button class="btn-icon btn-edit" onclick="openProductModal('${p.id}')"><i class="fa-solid fa-edit"></i></button>
                        <button class="btn-icon btn-delete" onclick="deleteProduct('${p.id}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

window.openProductModal = (id = null) => {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    if (!modal || !form) return;

    if (id) {
        const p = products.find(item => item.id === id);
        form.productId.value = p.id;
        form.name.value = p.name;
        form.category.value = p.category;
        form.price.value = p.price;
        form.status.value = p.status;
        form.description.value = p.description || '';
        updateProductPreview(p.image_url);
    } else {
        form.reset();
        form.productId.value = '';
        updateProductPreview(null);
    }
    modal.style.display = 'flex';
};

window.closeProductModal = () => {
    document.getElementById('product-modal').style.display = 'none';
};

window.previewProductImage = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => updateProductPreview(e.target.result);
        reader.readAsDataURL(file);
    }
};

function updateProductPreview(src) {
    const preview = document.getElementById('product-preview');
    if (!preview) return;
    if (src) {
        preview.innerHTML = `<img src="${src}" style="width:100%; height:100%; object-fit:cover;">`;
    } else {
        preview.innerHTML = '<span>انتخاب تصویر</span>';
    }
}

window.saveProduct = async (event) => {
    event.preventDefault();
    const form = event.target;
    const saveBtn = document.getElementById('save-product-btn');

    saveBtn.disabled = true;
    saveBtn.innerText = 'در حال ذخیره...';

    try {
        let imageUrl = products.find(p => p.id === form.productId.value)?.image_url || '';
        const imageFile = document.getElementById('product-image-input').files[0];

        if (imageFile) {
            imageUrl = await uploadImage(imageFile, 'products');
        }

        const data = {
            name: form.name.value.trim(),
            category: form.category.value,
            price: Number(form.price.value),
            status: form.status.value,
            description: form.description.value.trim(),
            image_url: imageUrl,
            updated_at: new Date().toISOString()
        };

        if (form.productId.value) {
            await supabase.from('products').update(data).eq('id', form.productId.value);
        } else {
            await supabase.from('products').insert([{ ...data, created_at: new Date().toISOString() }]);
        }

        closeProductModal();
    } catch (error) {
        alert('خطا در ذخیره محصول: ' + error.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = 'ذخیره محصول';
    }
};

window.deleteProduct = async (id) => {
    if (!confirm('آیا از حذف این محصول اطمینان دارید؟')) return;
    try {
        await supabase.from('products').delete().eq('id', id);
    } catch (error) {
        alert('خطا در حذف محصول: ' + error.message);
    }
};

// Banners Logic
let banners = [];

async function loadBanners() {
    const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('order_priority', { ascending: false });

    if (error) {
        console.error('Error fetching banners:', error);
        return;
    }

    banners = data;
    renderBanners();

    const sub = supabase
        .channel('admin-banners')
        .on('postgres_changes', { event: '*', table: 'banners' }, async () => {
            const { data } = await supabase.from('banners').select('*').order('order_priority', { ascending: false });
            banners = data;
            renderBanners();
        })
        .subscribe();

    unsubscribers.push(() => supabase.removeChannel(sub));
}

function renderBanners() {
    const tbody = document.getElementById('banners-tbody');
    if (!tbody) return;

    if (banners.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">بنری یافت نشد.</td></tr>';
    } else {
        tbody.innerHTML = banners.map(b => `
            <tr>
                <td><img src="${b.image_url}" width="100" height="50" style="border-radius:5px; object-fit:cover;"></td>
                <td>${b.title || 'بدون عنوان'}</td>
                <td dir="ltr">${b.link || '-'}</td>
                <td>${b.order_priority}</td>
                <td><span class="status-badge ${b.status}">${b.status === 'active' ? 'فعال' : 'غیرفعال'}</span></td>
                <td>
                    <div class="actions">
                        <button class="btn-icon btn-edit" onclick="openBannerModal('${b.id}')"><i class="fa-solid fa-edit"></i></button>
                        <button class="btn-icon btn-delete" onclick="deleteBanner('${b.id}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

window.openBannerModal = (id = null) => {
    const modal = document.getElementById('banner-modal');
    const form = document.getElementById('banner-form');
    if (!modal || !form) return;

    if (id) {
        const b = banners.find(item => item.id === id);
        form.bannerId.value = b.id;
        form.title.value = b.title || '';
        form.link.value = b.link || '';
        form.priority.value = b.order_priority;
        form.status.value = b.status;
        updateBannerPreview(b.image_url);
    } else {
        form.reset();
        form.bannerId.value = '';
        updateBannerPreview(null);
    }
    modal.style.display = 'flex';
};

window.closeBannerModal = () => {
    document.getElementById('banner-modal').style.display = 'none';
};

window.previewBannerImage = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => updateBannerPreview(e.target.result);
        reader.readAsDataURL(file);
    }
};

function updateBannerPreview(src) {
    const preview = document.getElementById('banner-preview');
    if (!preview) return;
    if (src) {
        preview.innerHTML = `<img src="${src}" style="width:100%; height:100%; object-fit:cover;">`;
    } else {
        preview.innerHTML = '<span>انتخاب تصویر</span>';
    }
}

window.saveBanner = async (event) => {
    event.preventDefault();
    const form = event.target;
    const saveBtn = document.getElementById('save-banner-btn');

    saveBtn.disabled = true;
    saveBtn.innerText = 'در حال ذخیره...';

    try {
        let imageUrl = banners.find(b => b.id === form.bannerId.value)?.image_url || '';
        const imageFile = document.getElementById('banner-image-input').files[0];

        if (imageFile) {
            imageUrl = await uploadImage(imageFile, 'site');
        }

        if (!imageUrl) return alert('لطفا یک تصویر انتخاب کنید');

        const data = {
            title: form.title.value.trim(),
            link: form.link.value.trim(),
            order_priority: Number(form.priority.value),
            status: form.status.value,
            image_url: imageUrl
        };

        if (form.bannerId.value) {
            await supabase.from('banners').update(data).eq('id', form.bannerId.value);
        } else {
            await supabase.from('banners').insert([{ ...data, created_at: new Date().toISOString() }]);
        }

        closeBannerModal();
    } catch (error) {
        alert('خطا در ذخیره بنر: ' + error.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = 'ذخیره بنر';
    }
};

window.deleteBanner = async (id) => {
    if (!confirm('آیا از حذف این بنر اطمینان دارید؟')) return;
    try {
        await supabase.from('banners').delete().eq('id', id);
    } catch (error) {
        alert('خطا در حذف بنر: ' + error.message);
    }
};

// Discounts Logic
let discounts = [];

async function loadDiscounts() {
    const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching discounts:', error);
        return;
    }

    discounts = data;
    renderDiscounts();

    const sub = supabase
        .channel('admin-discounts')
        .on('postgres_changes', { event: '*', table: 'discounts' }, async () => {
            const { data } = await supabase.from('discounts').select('*').order('created_at', { ascending: false });
            discounts = data;
            renderDiscounts();
        })
        .subscribe();

    unsubscribers.push(() => supabase.removeChannel(sub));
}

function renderDiscounts() {
    const tbody = document.getElementById('discounts-tbody');
    if (!tbody) return;

    if (discounts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">کد تخفیفی یافت نشد.</td></tr>';
    } else {
        tbody.innerHTML = discounts.map(d => `
            <tr>
                <td dir="ltr" style="font-weight:bold; color:var(--primary);">${d.code}</td>
                <td>${d.amount.toLocaleString('fa-IR')} ${d.type === 'percentage' ? '٪' : 'تومان'}</td>
                <td>${d.type === 'percentage' ? 'درصدی' : 'مبلغ ثابت'}</td>
                <td>${d.usage_limit || 'نامحدود'}</td>
                <td>${d.usage_count}</td>
                <td><span class="status-badge ${d.status}">${d.status === 'active' ? 'فعال' : 'غیرفعال'}</span></td>
                <td>
                    <div class="actions">
                        <button class="btn-icon btn-edit" onclick="openDiscountModal('${d.id}')"><i class="fa-solid fa-edit"></i></button>
                        <button class="btn-icon btn-delete" onclick="deleteDiscount('${d.id}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

window.openDiscountModal = (id = null) => {
    const modal = document.getElementById('discount-modal');
    const form = document.getElementById('discount-form');
    if (!modal || !form) return;

    if (id) {
        const d = discounts.find(item => item.id === id);
        form.discountId.value = d.id;
        form.code.value = d.code;
        form.amount.value = d.amount;
        form.type.value = d.type;
        form.limit.value = d.usage_limit || '';
        form.startDate.value = d.start_date ? d.start_date.split('T')[0] : '';
        form.endDate.value = d.end_date ? d.end_date.split('T')[0] : '';
        form.status.value = d.status;
    } else {
        form.reset();
        form.discountId.value = '';
    }
    modal.style.display = 'flex';
};

window.closeDiscountModal = () => {
    document.getElementById('discount-modal').style.display = 'none';
};

window.saveDiscount = async (event) => {
    event.preventDefault();
    const form = event.target;
    const saveBtn = document.getElementById('save-discount-btn');

    saveBtn.disabled = true;
    saveBtn.innerText = 'در حال ذخیره...';

    try {
        const data = {
            code: form.code.value.trim().toUpperCase(),
            amount: Number(form.amount.value),
            type: form.type.value,
            usage_limit: form.limit.value ? Number(form.limit.value) : null,
            start_date: form.startDate.value || null,
            end_date: form.endDate.value || null,
            status: form.status.value,
            updated_at: new Date().toISOString()
        };

        if (form.discountId.value) {
            await supabase.from('discounts').update(data).eq('id', form.discountId.value);
        } else {
            await supabase.from('discounts').insert([{ ...data, created_at: new Date().toISOString() }]);
        }

        closeDiscountModal();
    } catch (error) {
        alert('خطا در ذخیره کد تخفیف: ' + error.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = 'ذخیره کد';
    }
};

window.deleteDiscount = async (id) => {
    if (!confirm('آیا از حذف این کد تخفیف اطمینان دارید؟')) return;
    try {
        await supabase.from('discounts').delete().eq('id', id);
    } catch (error) {
        alert('خطا در حذف کد تخفیف: ' + error.message);
    }
};

// Logout
window.logout = async () => {
    if (confirm('آیا مطمئن هستید که می‌خواهید خارج شوید؟')) {
        try {
            // Using the centralized signOut with redirect to the main home page
            // which will then be handled by the base URL logic in supabase-auth.js
            await supabaseSignOut('/index.html');
        } catch (error) {
            console.error('Logout error:', error);
            // Fallback
            location.replace('../index.html');
        }
    }
};

// Initial Load
document.addEventListener('DOMContentLoaded', async () => {
    await loadComponent('sidebar-container', 'components/sidebar.html');
    await loadComponent('header-container', 'components/header.html');

    // Setup Sidebar Click Listeners
    document.addEventListener('click', (e) => {
        const li = e.target.closest('.sidebar-nav li');
        if (li) {
            const page = li.dataset.page;
            if (page) {
                // Capitalize first letter to match navigateTo expectation
                const viewName = page.charAt(0).toUpperCase() + page.slice(1);
                navigateTo(viewName);
            }
        }

        // Handle common logout button selectors
        if (e.target.closest('#logout-btn') || e.target.closest('.logout-item') || e.target.closest('.btn-logout')) {
            logout();
        }
    });

    // Default View
    window.navigateTo('Dashboard');
});
