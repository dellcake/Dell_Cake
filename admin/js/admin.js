import { CoursesModule } from "./modules/courses.js";
import { GalleryModule } from "./modules/gallery.js";
import { CategoriesModule } from "./modules/categories.js";
import { ProductsModule } from "./modules/products.js";
import { OrdersModule } from "./modules/orders.js";
import { SettingsModule } from "./modules/settings.js";
import { MigrationModule } from "./modules/migration.js";
import { BlogModule, MessagesModule } from "./modules/common.js";
import { loadDashboardData } from "./modules/dashboard.js";

async function loadComponent(id, path) {
    try {
        const response = await fetch(path);
        const html = await response.text();
        document.getElementById(id).innerHTML = html;
        return true;
    } catch (error) {
        return false;
    }
}

window.navigateTo = async (viewName) => {
    document.getElementById('main-view').innerHTML = '<div class="loader-wrapper"><div class="loader"></div></div>';

    document.querySelectorAll('.sidebar-nav li').forEach(li => {
        li.classList.remove('active');
        if (li.dataset.page === viewName.toLowerCase()) li.classList.add('active');
    });

    const success = await loadComponent('main-view', `pages/${viewName.toLowerCase()}.html`);
    if (success) {
        if (viewName === 'Dashboard') loadDashboardData();
        if (viewName === 'Courses') CoursesModule.load();
        if (viewName === 'Gallery') GalleryModule.load();
        if (viewName === 'Categories') CategoriesModule.load();
        if (viewName === 'Products') ProductsModule.load();
        if (viewName === 'Orders') OrdersModule.load();
        if (viewName === 'Settings') SettingsModule.load();
        if (viewName === 'Blog') BlogModule.load();
        if (viewName === 'Messages') MessagesModule.load();
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    await loadComponent('sidebar-container', 'components/sidebar.html');
    await loadComponent('header-container', 'components/header.html');

    // Sidebar Toggle Logic
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const closeBtn = document.getElementById('close-mobile-menu');
    const overlay = document.getElementById('sidebar-overlay');
    const sidebar = document.getElementById('admin-sidebar');

    function toggleSidebar() {
        if (!sidebar) return;
        sidebar.classList.toggle('open');
        overlay.classList.toggle('show');
        document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
    }

    if (toggleBtn) toggleBtn.addEventListener('click', toggleSidebar);
    if (closeBtn) closeBtn.addEventListener('click', toggleSidebar);
    if (overlay) overlay.addEventListener('click', toggleSidebar);

    document.addEventListener('click', (e) => {
        const li = e.target.closest('.sidebar-nav li');
        if (li) {
            const page = li.dataset.page;
            if (page) {
                const viewName = page.charAt(0).toUpperCase() + page.slice(1);
                navigateTo(viewName);

                // Close sidebar on mobile after navigation
                if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('open')) {
                    toggleSidebar();
                }
            }
        }
    });

    window.navigateTo('Dashboard');

    // Profile Dropdown Logic
    setupProfileDropdown();

    // Initial Profile Data
    updateProfileInfo();
});

function setupProfileDropdown() {
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('#profile-trigger');
        const dropdown = document.getElementById('profile-dropdown');

        if (trigger) {
            trigger.classList.toggle('active');
            dropdown.classList.toggle('show');
        } else if (!e.target.closest('.admin-profile-container')) {
            const activeTrigger = document.querySelector('#profile-trigger.active');
            const openDropdown = document.querySelector('#profile-dropdown.show');
            if (activeTrigger) activeTrigger.classList.remove('active');
            if (openDropdown) openDropdown.classList.remove('show');
        }
    });

    // Handle logout from dropdown and sidebar
    document.addEventListener('click', async (e) => {
        const logoutBtn = e.target.closest('#logout-btn-dropdown') || e.target.closest('.logout-item');
        if (logoutBtn) {
            e.preventDefault();
            const { supabase } = await import('../../js/supabase-client.js');
            await supabase.auth.signOut();
            location.replace('login.html');
        }
    });
}

async function updateProfileInfo() {
    const { supabase } = await import('../../js/supabase-client.js');
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        const user = session.user;
        const nameElem = document.getElementById('admin-name');
        const emailElem = document.getElementById('dropdown-admin-email');
        const avatarElem = document.getElementById('admin-avatar');

        if (nameElem) nameElem.textContent = user.user_metadata?.full_name || 'مدیر سایت';
        if (emailElem) emailElem.textContent = user.email;

        // Admin Avatar: Show Dell Cake logo for specific admin or if avatar is missing
        if (avatarElem) {
            const isOfficialAdmin = user.email === 'dellcake.orders@gmail.com';
            if (isOfficialAdmin || !user.user_metadata?.avatar_url) {
                avatarElem.src = '../images/logo/sweet-.png';
            } else {
                avatarElem.src = user.user_metadata.avatar_url;
            }
        }
    }
}
