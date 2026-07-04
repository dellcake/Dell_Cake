import { supabase } from "../../../js/supabase-client.js";

export async function loadDashboardData(unsubscribers) {
    try {
        // 1. Fetch Basic Stats
        const [
            { count: userCount },
            { count: orderCount },
            { data: ordersData },
            { count: courseCount },
            { data: siteSettings }
        ] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'new'),
            supabase.from('orders').select('price, status, created_at, customer_name'),
            supabase.from('courses').select('*', { count: 'exact', head: true }).eq('status', 'published'),
            supabase.from('site_settings').select('value').eq('key', 'site_config').single()
        ]);

        // Calculate total sales
        const totalSales = ordersData
            ?.filter(o => o.status === 'completed')
            ?.reduce((sum, o) => sum + (Number(o.price) || 0), 0) || 0;

        // Update UI elements
        document.getElementById('total-sales').innerText = `${totalSales.toLocaleString('fa-IR')} تومان`;
        document.getElementById('total-users').innerText = (userCount || 0).toLocaleString('fa-IR');
        document.getElementById('new-orders').innerText = (orderCount || 0).toLocaleString('fa-IR');
        document.getElementById('active-courses').innerText = (courseCount || 0).toLocaleString('fa-IR');

        // Populate Recent Orders
        const recentOrdersList = document.getElementById('recent-orders-list');
        if (recentOrdersList && ordersData) {
            const recent = ordersData
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 5);

            recentOrdersList.innerHTML = recent.map(order => `
                <tr>
                    <td>${order.customer_name || 'کاربر جدید'}</td>
                    <td>${(Number(order.price) || 0).toLocaleString('fa-IR')}</td>
                    <td><span class="badge ${getStatusBadgeClass(order.status)}">${translateStatus(order.status)}</span></td>
                </tr>
            `).join('');
        }

        // Popular Courses (Placeholder logic)
        const popularList = document.getElementById('popular-courses');
        if (popularList) {
            const { data: popular } = await supabase.from('courses').select('title, price').limit(3);
            popularList.innerHTML = (popular || []).map(course => `
                <div class="status-item">
                    <div class="status-info">
                        <span>${course.title}</span>
                        <span class="role">${(Number(course.price) || 0).toLocaleString('fa-IR')} تومان</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${Math.random() * 100}%;"></div>
                    </div>
                </div>
            `).join('');
        }

        // Initialize Chart
        initSalesChart(ordersData);

        // Update Admin Info from Site Settings
        if (siteSettings?.value) {
            document.getElementById('admin-name').innerText = siteSettings.value.siteName || 'مدیر سایت';
        }

    } catch (error) {
        console.error("Error loading dashboard data:", error);
    }
}

function initSalesChart(orders) {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;

    // Group sales by day (last 7 days)
    const days = [];
    const sales = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('fa-IR', { weekday: 'long' });
        days.push(dateStr);

        const daySales = orders
            ?.filter(o => {
                const oDate = new Date(o.created_at);
                return oDate.toDateString() === date.toDateString() && o.status === 'completed';
            })
            ?.reduce((sum, o) => sum + (Number(o.price) || 0), 0) || 0;
        sales.push(daySales);
    }

    // Load Chart.js dynamically if not present
    if (typeof Chart === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => createChart(ctx, days, sales);
        document.head.appendChild(script);
    } else {
        createChart(ctx, days, sales);
    }
}

function createChart(ctx, labels, data) {
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'فروش روزانه',
                data: data,
                borderColor: '#e8789a',
                backgroundColor: 'rgba(232, 120, 154, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#e8789a'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#a0a0a0', font: { family: 'Vazirmatn' } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#a0a0a0', font: { family: 'Vazirmatn' } }
                }
            }
        }
    });
}

function getStatusBadgeClass(status) {
    const map = {
        'new': 'badge-info',
        'pending': 'badge-warning',
        'preparing': 'badge-info',
        'ready': 'badge-success',
        'completed': 'badge-success',
        'cancelled': 'badge-danger'
    };
    return map[status] || 'badge-info';
}

function translateStatus(status) {
    const map = {
        'new': 'جدید',
        'pending': 'در حال بررسی',
        'preparing': 'آماده‌سازی',
        'ready': 'آماده تحویل',
        'completed': 'تکمیل شده',
        'cancelled': 'لغو شده'
    };
    return map[status] || status;
}
