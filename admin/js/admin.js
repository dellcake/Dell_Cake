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

    document.addEventListener('click', (e) => {
        const li = e.target.closest('.sidebar-nav li');
        if (li) {
            const page = li.dataset.page;
            if (page) {
                const viewName = page.charAt(0).toUpperCase() + page.slice(1);
                navigateTo(viewName);
            }
        }
    });

    window.navigateTo('Dashboard');

    // Handle logout
    document.addEventListener('click', async (e) => {
        const logoutLi = e.target.closest('.logout-item');
        if (logoutLi) {
            const { supabase } = await import('../../js/supabase-client.js');
            await supabase.auth.signOut();
            location.replace('login.html');
        }
    });
});
