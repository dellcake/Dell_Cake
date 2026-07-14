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

    render(filteredOrders = null) {
        const tbody = document.getElementById('orders-tbody');
        if (!tbody) return;

        const displayOrders = filteredOrders || this.orders;

        if (displayOrders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">سفارشی یافت نشد.</td></tr>';
        } else {
            tbody.innerHTML = displayOrders.map(order => `
                <tr>
                    <td data-label="شناسه" style="font-family: monospace; font-size: 0.8rem;">#${order.id.substring(0, 8)}</td>
                    <td data-label="مشتری">
                        <div style="font-weight: 700;">${order.customer_name}</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted);">${order.phone}</div>
                    </td>
                    <td data-label="نوع سفارش">${order.product_name || 'نامشخص'}</td>
                    <td data-label="تاریخ ثبت" style="font-size: 0.85rem;">${new Date(order.created_at).toLocaleDateString('fa-IR')}</td>
                    <td data-label="تاریخ تحویل" style="font-size: 0.85rem;">${order.details?.deliveryDate || order.details?.delivery_date || 'نامشخص'}</td>
                    <td data-label="وضعیت"><span class="status-badge ${order.status}">${this.translateStatus(order.status)}</span></td>
                    <td data-label="عملیات">
                        <div class="actions">
                            <button class="btn-icon" onclick="OrdersModule.viewDetail('${order.id}')" title="مشاهده جزئیات"><i class="fa-solid fa-eye"></i></button>
                            <button class="btn-icon btn-delete" onclick="OrdersModule.delete('${order.id}')"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    },

    handleSearch(query) {
        const q = query.toLowerCase();
        const filtered = this.orders.filter(o =>
            o.customer_name.toLowerCase().includes(q) ||
            o.phone.includes(q) ||
            o.id.includes(q) ||
            (o.details?.cake_type && o.details.cake_type.toLowerCase().includes(q))
        );
        this.render(filtered);
    },

    exportCSV() {
        if (this.orders.length === 0) return alert('سفارشی برای خروجی وجود ندارد.');

        let csv = 'ID,Customer,Phone,Cake Type,Delivery Date,Status\n';
        this.orders.forEach(o => {
            csv += `${o.id},${o.customer_name},${o.phone},${o.details?.cake_type || ''},${o.details?.delivery_date || ''},${o.status}\n`;
        });

        const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "dellcake-orders.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
        const modal = document.getElementById('order-modal');
        const content = document.getElementById('order-details-content');
        if (!modal || !content) return;

        // Extract extra fields if any
        let fieldsHtml = '';
        if (order.details?.fields) {
            fieldsHtml = Object.entries(order.details.fields)
                .filter(([k, v]) => v)
                .map(([k, v]) => `<div class="detail-item"><label>${this.translateFieldKey(k)}:</label> <span>${v}</span></div>`)
                .join('');
        }

        content.innerHTML = `
            <div style="grid-column: 1/-1; background: var(--accent); padding: 15px; border-radius: 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h4 style="color: var(--secondary); margin-bottom: 5px;">${order.customer_name}</h4>
                    <span class="status-badge ${order.status}">${this.translateStatus(order.status)}</span>
                </div>
                <div style="display: flex; gap: 10px;">
                    <a href="tel:${order.phone}" class="btn btn-outline btn-sm"><i class="fas fa-phone"></i> تماس</a>
                    <a href="https://t.me/${order.phone.replace(/^0/, '+98')}" target="_blank" class="btn btn-outline btn-sm"><i class="fab fa-telegram"></i> تلگرام</a>
                </div>
            </div>

            <div class="detail-item"><label>نوع سفارش:</label> <span>${order.product_name || 'نامشخص'}</span></div>
            <div class="detail-item"><label>شماره تماس:</label> <span>${order.phone}</span></div>
            <div class="detail-item"><label>وزن تقریبی:</label> <span>${order.details?.weight || 'نامشخص'} کیلوگرم</span></div>
            <div class="detail-item"><label>تاریخ تحویل:</label> <span>${order.details?.deliveryDate || order.details?.delivery_date || 'نامشخص'}</span></div>
            <div class="detail-item"><label>ساعت تحویل:</label> <span>${order.details?.deliveryTime || 'نامشخص'}</span></div>
            <div class="detail-item"><label>تاریخ ثبت:</label> <span>${new Date(order.created_at).toLocaleDateString('fa-IR')}</span></div>

            ${fieldsHtml}

            <div class="detail-item order-full-width" style="border-top: 1px solid var(--border-color); padding-top: 15px;">
                <label>توضیحات و آدرس:</label>
                <p style="background: #f9f9f9; padding: 12px; border-radius: 8px; font-size: 0.9rem; white-space: pre-wrap;">${order.address || 'توضیحاتی ثبت نشده'}</p>
            </div>

            <div class="detail-item order-full-width">
                <label>تغییر وضعیت سفارش:</label>
                <select class="form-control" onchange="OrdersModule.updateStatus('${order.id}', this.value)">
                    <option value="new" ${order.status === 'new' ? 'selected' : ''}>جدید (بررسی نشده)</option>
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>در حال بررسی</option>
                    <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>در حال آماده‌سازی</option>
                    <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>آماده تحویل / ارسال</option>
                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>تحویل شده (پایان)</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>لغو شده</option>
                </select>
            </div>
        `;
        modal.style.display = 'flex';
    },

    translateFieldKey(key) {
        const map = {
            'birthdayFlavor': 'طعم کیک', 'birthdayFilling': 'فیلینگ', 'birthdayDesign': 'سبک طراحی', 'birthdayColors': 'رنگ‌ها', 'birthdayText': 'متن روی کیک',
            'kidFlavor': 'طعم', 'kidFilling': 'فیلینگ', 'kidDesign': 'طراحی', 'kidCharacter': 'شخصیت', 'kidColors': 'رنگ‌ها',
            'engagementFlavor': 'طعم', 'engagementFilling': 'فیلینگ', 'engagementDesign': 'طراحی', 'engagementTheme': 'تم', 'engagementText': 'متن',
            'weddingFloors': 'تعداد طبقات', 'weddingFlavor': 'طعم', 'weddingFilling': 'فیلینگ', 'weddingDesign': 'طراحی', 'weddingTheme': 'تم مراسم', 'weddingColors': 'رنگ‌ها',
            'customTheme': 'موضوع', 'customFlavor': 'طعم', 'customFilling': 'فیلینگ', 'customDesign': 'طراحی', 'customColors': 'رنگ‌ها', 'customText': 'متن'
        };
        return map[key] || key;
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
window.closeOrderModal = () => document.getElementById('order-modal').style.display = 'none';
window.handleOrderSearch = (val) => OrdersModule.handleSearch(val);
window.handleOrderFilter = () => OrdersModule.render(); // Simple render for now as placeholder
window.exportOrdersToCSV = () => OrdersModule.exportCSV();
window.printOrder = () => window.print();
window.changeOrderPage = (dir) => console.log('Pagination clicked:', dir);
