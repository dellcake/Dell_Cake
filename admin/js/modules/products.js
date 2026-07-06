import { supabase } from "../../../js/supabase-client.js";

/**
 * Products Management Module
 */
export const ProductsModule = {
    products: [],

    async load() {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) return console.error('Error fetching products:', error);
        this.products = data;
        this.render();
    },

    render() {
        const tbody = document.getElementById('products-tbody');
        if (!tbody) return;

        if (this.products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">محصولی یافت نشد.</td></tr>';
        } else {
            tbody.innerHTML = this.products.map(p => `
                <tr>
                    <td><img src="${p.image_url || '../images/logo/sweet-.png'}" width="50" height="50" style="border-radius:8px; object-fit:cover;"></td>
                    <td>${p.name}</td>
                    <td>${(Number(p.price) || 0).toLocaleString('fa-IR')} تومان</td>
                    <td>${this.translateCategory(p.category)}</td>
                    <td><span class="status-badge ${p.status || 'active'}">${p.status === 'active' ? 'فعال' : 'غیرفعال'}</span></td>
                    <td>
                        <div class="actions">
                            <button class="btn-icon btn-edit" onclick="ProductsModule.openModal('${p.id}')"><i class="fa-solid fa-edit"></i></button>
                            <button class="btn-icon btn-delete" onclick="ProductsModule.delete('${p.id}')"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    },

    openModal(id = null) {
        const modal = document.getElementById('product-modal');
        const form = document.getElementById('product-form');
        if (!modal || !form) return;

        if (id) {
            const p = this.products.find(item => item.id === id);
            form.productId.value = p.id;
            form.name.value = p.name;
            form.category.value = p.category;
            form.price.value = p.price;
            form.status.value = p.status;
            form.description.value = p.description || '';
        } else {
            form.reset();
            form.productId.value = '';
        }
        modal.style.display = 'flex';
    },

    async save(event) {
        event.preventDefault();
        const form = event.target;
        const data = {
            name: form.name.value.trim(),
            category: form.category.value,
            price: Number(form.price.value),
            status: form.status.value,
            description: form.description.value.trim(),
            updated_at: new Date().toISOString()
        };

        const id = form.productId.value;
        if (id) {
            await supabase.from('products').update(data).eq('id', id);
        } else {
            await supabase.from('products').insert([{ ...data, created_at: new Date().toISOString() }]);
        }

        document.getElementById('product-modal').style.display = 'none';
        this.load();
    },

    async delete(id) {
        if (!confirm('آیا از حذف این محصول اطمینان دارید؟')) return;
        await supabase.from('products').delete().eq('id', id);
        this.load();
    },

    translateCategory(cat) {
        const map = { 'cake': 'کیک', 'pastry': 'شیرینی', 'dessert': 'دسر' };
        return map[cat] || cat;
    }
};

window.ProductsModule = ProductsModule;
window.saveProduct = (e) => ProductsModule.save(e);
window.openProductModal = (id) => ProductsModule.openModal(id);
window.closeProductModal = () => document.getElementById('product-modal').style.display = 'none';
