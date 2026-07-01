import { supabase } from "../../js/supabase-client.js";
import { onAuthStateChange, signOut } from "../../js/supabase-auth.js";

onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT' || !session) {
        window.location.replace('login.html');
        return;
    }

    const user = session.user;

    // Set User Profile UI
    const nameDisplay = document.getElementById('user-display-name');
    const welcomeMsg = document.getElementById('welcome-msg');

    const displayName = user.user_metadata?.display_name || user.email.split('@')[0];
    if (nameDisplay) nameDisplay.innerText = displayName;
    if (welcomeMsg) welcomeMsg.innerText = `سلام ${displayName}! خوش آمدی`;

    // Load User Specific Data
    loadUserOrders(user.id);
});

async function loadUserOrders(userId) {
    const orderList = document.getElementById('user-orders-list');
    if (!orderList) return;

    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            orderList.innerHTML = '<p class="empty-msg">هنوز سفارشی ثبت نکرده‌اید.</p>';
            return;
        }

        orderList.innerHTML = data.map(order => `
            <div class="order-item">
                <div class="order-header">
                    <span>سفارش #${order.id.slice(-6).toUpperCase()}</span>
                    <span class="order-status ${order.status}">${translateStatus(order.status)}</span>
                </div>
                <div class="order-body">
                    <p>محصول: ${order.product_name}</p>
                    <p>مبلغ: ${Number(order.price).toLocaleString('fa-IR')} تومان</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error("Error loading user orders:", error);
    }
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

window.handleLogout = async () => {
    if (confirm('آیا می‌خواهید از پنل خود خارج شوید؟')) {
        await signOut();
        window.location.replace('login.html');
    }
};
