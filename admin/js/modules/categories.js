import { supabase } from "../../../js/supabase-client.js";
import { GalleryModule } from "./gallery.js";

/**
 * Category Management Module
 */
export const CategoriesModule = {
    items: [],

    async load() {
        try {
            const { data, error } = await supabase
                .from('gallery_categories')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            this.items = data || [];
            this.render();
        } catch (error) {
            console.error('Error fetching categories:', error);
            this.render();
        }
    },

    render() {
        const grid = document.getElementById('categories-grid');
        if (!grid) return;

        if (this.items.length === 0) {
            grid.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">دسته بندی یافت نشد.</td></tr>';
        } else {
            grid.innerHTML = this.items.map(cat => `
                <tr>
                    <td>${cat.display_order}</td>
                    <td><strong>${cat.name}</strong></td>
                    <td><code>${cat.slug}</code></td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="CategoriesModule.delete('${cat.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    },

    async add(event) {
        event.preventDefault();
        const name = document.getElementById('cat-name').value;
        const slug = document.getElementById('cat-slug').value;
        const order = document.getElementById('cat-order').value;

        try {
            const { error } = await supabase.from('gallery_categories').insert([{
                name,
                slug,
                display_order: parseInt(order) || 0
            }]);

            if (error) throw error;

            event.target.reset();
            this.load();
            GalleryModule.loadCategories(); // Refresh gallery module cache
        } catch (err) {
            alert('خطا در ایجاد دسته: ' + err.message);
        }
    },

    async delete(id) {
        if (!confirm('با حذف این دسته، نمونه‌کارهای مرتبط با آن بدون دسته خواهند شد. ادامه می‌دهید؟')) return;
        try {
            const { error } = await supabase.from('gallery_categories').delete().eq('id', id);
            if (error) throw error;
            this.load();
            GalleryModule.loadCategories();
        } catch (err) {
            alert('خطا در حذف: ' + err.message);
        }
    }
};

window.CategoriesModule = CategoriesModule;
window.handleCategoryAdd = (e) => CategoriesModule.add(e);
