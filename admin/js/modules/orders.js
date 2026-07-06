import { supabase } from "../../../js/supabase-client.js";

/**
 * Orders Management Module
 */
export const OrdersModule = {
    orders: [],

    async load() {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) return console.error('Error fetching orders:', error);
        this.orders = data;
        this.render();
    },

    render() {
        const tbody = document.getElementById('orders-tbody');
        if (!tbody) return;

        if (this.orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">سفارشی یافت نشد.</td></tr>';
        } else {
            tbody.innerHTML = this.orders.map(order => `
                <tr>
                    <td>#${order.id.slice(-6).toUpperCase()}</td>
                    <td>${order.customer_name || 'نامشخص'}</td>
                    <td>${order.product_name || 'محصول'}</td>
                    <td>${(Number(order.price) || 0).toLocaleString('fa-IR')}</td>
                    <td>${new Date(order.created_at).toLocaleDateString('fa-IR')}</td>
                    <td><span class="status-badge ${order.status}">${this.translateStatus(order.status)}</span></td>
                    <td>
                        <div class="actions">
                            <button class="btn-icon btn-edit" onclick="OrdersModule.openModal('${order.id}')"><i class="fa-solid fa-eye"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    },

    openModal(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        const modal = document.getElementById('order-modal');
        const content = document.getElementById('order-details-content');

        content.innerHTML = `
            <div class="detail-item">
                <label>شناسه سفارش</label>
                <span>#${order.id.toUpperCase()}</span>
            </div>
            <div class="detail-item">
                <label>نام مشتری</label>
                <span>${order.customer_name || 'نامشخص'}</span>
            </div>
            <div class="detail-item">
                <label>محصول/دوره</label>
                <span>${order.product_name || 'نامشخص'}</span>
            </div>
            <div class="detail-item">
                <label>مبلغ کل</label>
                <span>${(Number(order.price) || 0).toLocaleString('fa-IR')} تومان</span>
            </div>
            <div class="detail-item">
                <label>وضعیت فعلی</label>
                <select onchange="OrdersModule.updateStatus('${order.id}', this.value)" class="form-control">
                    <option value="new" ${order.status === 'new' ? 'selected' : ''}>جدید</option>
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>در حال بررسی</option>
                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>تکمیل شده</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>لغو شده</option>
                </select>
            </div>
        `;
        modal.style.display = 'flex';
    },

    async updateStatus(id, newStatus) {
        await supabase.from('orders').update({ status: newStatus }).eq('id', id);
        this.load();
    },

    translateStatus(status) {
        const map = {
            'new': 'جدید',
            'pending': 'در حال بررسی',
            'completed': 'تکمیل شده',
            'cancelled': 'لغو شده'
        };
        return map[status] || status;
    }
};

window.OrdersModule = OrdersModule;
window.closeOrderModal = () => document.getElementById('order-modal').style.display = 'none';
