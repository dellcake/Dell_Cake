import { supabase } from "../../../js/supabase-client.js";

/**
 * Dashboard Module
 * Handles data fetching, statistics, and charts for the admin dashboard.
 */

export async function loadDashboardData(unsubscribers) {
    // 1. Load Statistics via Realtime Subscriptions
    const coursesSub = supabase
        .channel('dashboard-courses')
        .on('postgres_changes', { event: '*', table: 'courses' }, () => updateDashboardStats())
        .subscribe();

    const ordersSub = supabase
        .channel('dashboard-orders')
        .on('postgres_changes', { event: '*', table: 'orders' }, () => updateDashboardStats())
        .subscribe();

    unsubscribers.push(() => supabase.removeChannel(coursesSub));
    unsubscribers.push(() => supabase.removeChannel(ordersSub));

    // Fetch initial data in parallel
    try {
        await Promise.all([
            updateDashboardStats(),
            updateMessageCount()
        ]);

        // Remove skeletons once initial data is loaded
        document.querySelectorAll('.skeleton').forEach(el => el.classList.remove('skeleton'));

        // 2. Load Chart
        await initDashboardChart();
    } catch (err) {
        console.error('Error loading initial dashboard data:', err);
    }
}

async function updateMessageCount() {
    try {
        const { count: msgCount } = await supabase
            .from('contact_messages')
            .select('*', { count: 'exact', head: true });

        const msgEl = document.getElementById('total-messages');
        if (msgEl) msgEl.innerText = (msgCount || 0).toLocaleString('fa-IR');
    } catch (err) {
        console.error('Error updating message count:', err);
    }
}

export async function updateDashboardStats() {
    try {
        // Fetch all necessary data in parallel
        const [coursesRes, ordersRes] = await Promise.all([
            supabase.from('courses').select('*', { count: 'exact', head: true }),
            supabase.from('orders').select('price, status, created_at, customer_name, product_name')
        ]);

        // Update Courses Count
        const courseEl = document.getElementById('total-courses-count');
        if (courseEl) courseEl.innerText = (coursesRes.count || 0).toLocaleString('fa-IR');

        // Update Orders & Revenue
        if (ordersRes.data) {
            const orderData = ordersRes.data;
            const totalEl = document.getElementById('total-orders-count');
            if (totalEl) totalEl.innerText = orderData.length.toLocaleString('fa-IR');

            const revenue = orderData
                .filter(o => o.status === 'completed')
                .reduce((sum, o) => sum + (Number(o.price) || 0), 0);

            const revEl = document.getElementById('total-revenue');
            if (revEl) revEl.innerText = `${revenue.toLocaleString('fa-IR')} تومان`;

            // Recent Orders
            renderRecentOrders(orderData);
        }
    } catch (err) {
        console.error('Error updating dashboard stats:', err);
    }
}

function renderRecentOrders(orderData) {
    const tbody = document.getElementById('recent-orders-tbody');
    if (!tbody) return;

    const recent = [...orderData]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

    if (recent.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">سفارشی یافت نشد.</td></tr>';
    } else {
        tbody.innerHTML = recent.map(o => `
            <tr>
                <td>${o.customer_name || 'نامشخص'}</td>
                <td>${o.product_name || 'محصول'}</td>
                <td><span class="status-badge ${o.status}">${translateStatus(o.status)}</span></td>
                <td>${(Number(o.price) || 0).toLocaleString('fa-IR')}</td>
            </tr>
        `).join('');
    }
}

export async function initDashboardChart() {
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
