import { supabase } from "../../../js/supabase-client.js";

/**
 * Products Management Module - Supabase Version
 */
export const ProductsModule = {
    products: [],

    async load() {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            this.products = data || [];
            this.render();
        } catch (error) {
            console.error('Error fetching products:', error);
            this.render();
        }
    },

    render() {
        const tbody = document.getElementById('products-tbody');
        if (!tbody) return;

        if (this.products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">محصولی یافت نشد.</td></tr>';
        } else {
            tbody.innerHTML = this.products.map(product => `
                <tr>
                    <td><img src="${product.image_url || '../images/logo/sweet-.png'}" width="50" height="50" style="border-radius:8px; object-fit:cover;"></td>
                    <td>${product.name}</td>
                    <td>${Number(product.price).toLocaleString('fa-IR')} تومان</td>
                    <td>${this.translateCategory(product.category)}</td>
                    <td><span class="status-badge ${product.status}">${this.translateStatus(product.status)}</span></td>
                    <td>
                        <div class="actions">
                            <button class="btn-icon btn-edit" onclick="ProductsModule.openModal('${product.id}')"><i class="fa-solid fa-edit"></i></button>
                            <button class="btn-icon btn-delete" onclick="ProductsModule.delete('${product.id}')"><i class="fa-solid fa-trash"></i></button>
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
            const product = this.products.find(p => p.id === id);
            form.productId.value = product.id;
            form.name.value = product.name || '';
            form.category.value = product.category || 'cake';
            form.price.value = product.price || 0;
            form.status.value = product.status || 'active';
            form.imageUrl.value = product.image_url || '';
            form.description.value = product.description || '';
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
            name: form.name.value,
            category: form.category.value,
            price: Number(form.price.value),
            status: form.status.value,
            image_url: form.imageUrl.value,
            description: form.description.value
        };

        const id = form.productId.value;
        try {
            if (id) {
                const { error } = await supabase.from('products').update(data).eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('products').insert([data]);
                if (error) throw error;
            }
            document.getElementById('product-modal').style.display = 'none';
            this.load();
        } catch (err) {
            alert('خطا در ذخیره: ' + err.message);
        }
    },

    async delete(id) {
        if (!confirm('آیا از حذف این محصول اطمینان دارید؟')) return;
        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            this.load();
        } catch (err) {
            alert('خطا در حذف: ' + err.message);
        }
    },

    translateCategory(cat) {
        const map = { 'cake': 'کیک', 'cupcake': 'کاپ کیک', 'dessert': 'دسر', 'cookie': 'کوکی' };
        return map[cat] || cat;
    },

    translateStatus(status) {
        const map = { 'active': 'فعال', 'inactive': 'غیرفعال' };
        return map[status] || status;
    }
};

window.ProductsModule = ProductsModule;
window.saveProduct = (e) => ProductsModule.save(e);
window.openProductModal = (id) => ProductsModule.openModal(id);
window.closeProductModal = () => document.getElementById('product-modal').style.display = 'none';

window.previewProductImage = (event) => {
    const input = event.target;
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            // Preview logic if we have a preview element in products.html
            // For now just update the hidden input value if we want dataURL or similar
            // Usually we'd want to upload it, but for simplicity:
            document.querySelector('input[name="imageUrl"]').value = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
};
