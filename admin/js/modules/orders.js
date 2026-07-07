import { supabase } from "../../../js/supabase-client.js";

/**
 * Orders Management Module - Supabase Version
 */
export const OrdersModule = {
    orders: [],

    async load() {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            this.orders = data || [];
            this.render();
        } catch (error) {
            console.error('Error fetching orders:', error);
            this.render();
        }
    },

    render() {
        const tbody = document.getElementById('orders-tbody');
        if (!tbody) return;

        if (this.orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">سفارشی ثبت نشده است.</td></tr>';
        } else {
            tbody.innerHTML = this.orders.map(order => `
                <tr>
                    <td>${order.id.substring(0, 8)}</td>
                    <td>${order.customer_name}</td>
                    <td>${order.phone}</td>
                    <td>${order.details?.cake_type || 'نامشخص'}</td>
                    <td>${order.details?.delivery_date ? new Date(order.details.delivery_date).toLocaleDateString('fa-IR') : 'نامشخص'}</td>
                    <td><span class="status-badge ${order.status}">${this.translateStatus(order.status)}</span></td>
                    <td>
                        <div class="actions">
                            <button class="btn-icon" onclick="OrdersModule.viewDetail('${order.id}')" title="مشاهده جزئیات"><i class="fa-solid fa-eye"></i></button>
                            <button class="btn-icon btn-delete" onclick="OrdersModule.delete('${order.id}')"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    },

    async updateStatus(id, newStatus) {
        try {
            const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
            if (error) throw error;
            this.load();
        } catch (err) {
            alert('خطا در بروزرسانی وضعیت: ' + err.message);
        }
    },

    async delete(id) {
        if (!confirm('آیا از حذف این سفارش اطمینان دارید؟')) return;
        try {
            const { error } = await supabase.from('orders').delete().eq('id', id);
            if (error) throw error;
            this.load();
        } catch (err) {
            alert('خطا در حذف: ' + err.message);
        }
    },

    viewDetail(id) {
        const order = this.orders.find(o => o.id === id);
        const modal = document.getElementById('order-detail-modal');
        const content = document.getElementById('order-detail-content');
        if (!modal || !content) return;

        content.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="detail-item"><label>نام مشتری:</label> <span>${order.customer_name}</span></div>
                <div class="detail-item"><label>شماره تماس:</label> <span>${order.phone}</span></div>
                <div class="detail-item"><label>نوع کیک:</label> <span>${order.details?.cake_type || 'نامشخص'}</span></div>
                <div class="detail-item"><label>تاریخ تحویل:</label> <span>${order.details?.delivery_date ? new Date(order.details.delivery_date).toLocaleDateString('fa-IR') : 'نامشخص'}</span></div>
                <div class="detail-item order-full-width"><label>آدرس:</label> <span>${order.address || 'آدرسی ثبت نشده'}</span></div>
                <div class="detail-item order-full-width"><label>توضیحات:</label> <span>${order.details?.description || 'توضیحاتی ثبت نشده'}</span></div>
                <div class="detail-item order-full-width">
                    <label>تغییر وضعیت:</label>
                    <select class="form-control" onchange="OrdersModule.updateStatus('${order.id}', this.value)">
                        <option value="new" ${order.status === 'new' ? 'selected' : ''}>جدید</option>
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>در انتظار بررسی</option>
                        <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>در حال آماده‌سازی</option>
                        <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>آماده تحویل</option>
                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>تکمیل شده</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>لغو شده</option>
                    </select>
                </div>
            </div>
        `;
        modal.style.display = 'flex';
    },

    translateStatus(status) {
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
};

window.OrdersModule = OrdersModule;
window.closeOrderDetailModal = () => document.getElementById('order-detail-modal').style.display = 'none';
