import { supabase } from "../../../js/supabase-client.js";
import { GalleryModule } from "./gallery.js";

/**
 * Category Management Module - Professional Version
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
        }
    },

    render() {
        const grid = document.getElementById('categories-grid');
        if (!grid) return;

        if (this.items.length === 0) {
            grid.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">دسته بندی یافت نشد.</td></tr>';
        } else {
            grid.innerHTML = this.items.map(cat => `
                <tr>
                    <td>${cat.display_order}</td>
                    <td><strong>${cat.name}</strong></td>
                    <td><code>${cat.slug}</code></td>
                    <td>
                        <span class="status-badge ${cat.is_active ? 'published' : 'draft'}">
                            ${cat.is_active ? 'فعال' : 'غیرفعال'}
                        </span>
                    </td>
                    <td>
                        <div class="actions">
                            <button class="btn-icon btn-edit" onclick="CategoriesModule.edit('${cat.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon btn-delete" onclick="CategoriesModule.delete('${cat.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    },

    async save(event) {
        event.preventDefault();
        const id = document.getElementById('cat-id').value;
        const name = document.getElementById('cat-name').value;
        const slug = document.getElementById('cat-slug').value;
        const order = document.getElementById('cat-order').value;
        const active = document.getElementById('cat-active').checked;

        const payload = {
            name,
            slug,
            display_order: parseInt(order) || 0,
            is_active: active
        };

        try {
            let error;
            if (id) {
                const { error: err } = await supabase.from('gallery_categories').update(payload).eq('id', id);
                error = err;
            } else {
                const { error: err } = await supabase.from('gallery_categories').insert([payload]);
                error = err;
            }

            if (error) throw error;

            this.resetForm();
            this.load();
            if (GalleryModule && GalleryModule.loadCategories) {
                GalleryModule.loadCategories();
            }
        } catch (err) {
            alert('خطا در ذخیره دسته: ' + err.message);
        }
    },

    edit(id) {
        const cat = this.items.find(i => i.id === id);
        if (!cat) return;

        document.getElementById('cat-id').value = cat.id;
        document.getElementById('cat-name').value = cat.name;
        document.getElementById('cat-slug').value = cat.slug;
        document.getElementById('cat-order').value = cat.display_order;
        document.getElementById('cat-active').checked = cat.is_active;

        document.getElementById('category-form-title').innerHTML = '<i class="fas fa-edit"></i> ویرایش دسته';
    },

    resetForm() {
        document.getElementById('category-form').reset();
        document.getElementById('cat-id').value = '';
        document.getElementById('category-form-title').innerHTML = '<i class="fas fa-plus"></i> دسته جدید';
    },

    async delete(id) {
        if (!confirm('آیا از حذف این دسته اطمینان دارید؟ نمونه‌کارهای مرتبط با آن بدون دسته خواهند شد.')) return;
        try {
            const { error } = await supabase.from('gallery_categories').delete().eq('id', id);
            if (error) throw error;
            this.load();
            if (GalleryModule && GalleryModule.loadCategories) {
                GalleryModule.loadCategories();
            }
        } catch (err) {
            alert('خطا در حذف: ' + err.message);
        }
    }
};

window.CategoriesModule = CategoriesModule;
window.handleCategorySave = (e) => CategoriesModule.save(e);
window.resetCategoryForm = () => CategoriesModule.resetForm();
