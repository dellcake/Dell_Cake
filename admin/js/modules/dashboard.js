import { supabase } from "../../../js/supabase-client.js";

export async function loadDashboardData() {
    const stats = {
        totalOrders: 0,
        pendingOrders: 0,
        totalProducts: 0,
        totalCourses: 0
    };

    try {
        // Fetch Orders Stats
        const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true });
        const { count: pendingOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending');

        stats.totalOrders = totalOrders || 0;
        stats.pendingOrders = pendingOrders || 0;

        // Fetch Products Stats
        const { count: totalProducts } = await supabase.from('products').select('*', { count: 'exact', head: true });
        stats.totalProducts = totalProducts || 0;

        // Fetch Courses Stats
        const { count: totalCourses } = await supabase.from('courses').select('*', { count: 'exact', head: true });
        stats.totalCourses = totalCourses || 0;

        updateUI(stats);
        loadRecentOrders();
    } catch (error) {
        console.error('Dashboard error:', error);
        updateUI(stats);
    }
}

function updateUI(stats) {
    const mappings = {
        'new-orders': stats.pendingOrders, // Updated to match dashboard.html IDs
        'total-courses': stats.totalCourses,
        'total-gallery': 0 // We can add this if needed
    };

    for (const [id, value] of Object.entries(mappings)) {
        const el = document.getElementById(id);
        if (el) el.innerText = value.toLocaleString('fa-IR');
    }
}

async function loadRecentOrders() {
    const tbody = document.getElementById('recent-orders-tbody');
    if (!tbody) return;

    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) throw error;

        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">سفارشی یافت نشد</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(order => `
            <tr>
                <td>${order.customer_name}</td>
                <td>${order.details?.cake_type || 'نامشخص'}</td>
                <td>${new Date(order.created_at).toLocaleDateString('fa-IR')}</td>
                <td><span class="status-badge ${order.status}">${translateStatus(order.status)}</span></td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Recent orders error:', error);
    }
}

function translateStatus(status) {
    const map = {
        'new': 'جدید',
        'pending': 'در انتظار',
        'preparing': 'در حال پخت',
        'ready': 'آماده تحویل',
        'completed': 'تحویل شده',
        'cancelled': 'لغو شده'
    };
    return map[status] || status;
}
