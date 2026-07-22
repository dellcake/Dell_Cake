import { supabase } from "../../../js/supabase-client.js";

/**
 * Course Category Management Module
 */
export const CourseCategoriesModule = {
    items: [],

    async load() {
        try {
            const { data, error } = await supabase
                .from('course_categories')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            this.items = data || [];
            this.render();
        } catch (error) {
            console.error('Error fetching course categories:', error);
        }
    },

    render() {
        const grid = document.getElementById('course-categories-grid');
        if (!grid) return;

        if (this.items.length === 0) {
            grid.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">دسته بندی یافت نشد.</td></tr>';
        } else {
            grid.innerHTML = this.items.map(cat => `
                <tr>
                    <td data-label="ترتیب">${cat.display_order}</td>
                    <td data-label="نام"><strong>${cat.name}</strong></td>
                    <td data-label="Slug"><code>${cat.slug}</code></td>
                    <td data-label="وضعیت">
                        <span class="status-badge ${cat.is_active ? 'published' : 'draft'}">
                            ${cat.is_active ? 'فعال' : 'غیرفعال'}
                        </span>
                    </td>
                    <td data-label="عملیات">
                        <div class="actions">
                            <button class="btn-icon btn-edit" onclick="CourseCategoriesModule.edit('${cat.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon btn-delete" onclick="CourseCategoriesModule.delete('${cat.id}')">
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
        const id = document.getElementById('course-cat-id').value;
        const name = document.getElementById('course-cat-name').value;
        const slug = document.getElementById('course-cat-slug').value;
        const order = document.getElementById('course-cat-order').value;
        const active = document.getElementById('course-cat-active').checked;

        const payload = {
            name,
            slug,
            display_order: parseInt(order) || 0,
            is_active: active
        };

        try {
            let error;
            if (id) {
                const { error: err } = await supabase.from('course_categories').update(payload).eq('id', id);
                error = err;
            } else {
                const { error: err } = await supabase.from('course_categories').insert([payload]);
                error = err;
            }

            if (error) throw error;

            this.resetForm();
            this.load();
        } catch (err) {
            alert('خطا در ذخیره دسته: ' + err.message);
        }
    },

    edit(id) {
        const cat = this.items.find(i => i.id === id);
        if (!cat) return;

        document.getElementById('course-cat-id').value = cat.id;
        document.getElementById('course-cat-name').value = cat.name;
        document.getElementById('course-cat-slug').value = cat.slug;
        document.getElementById('course-cat-order').value = cat.display_order;
        document.getElementById('course-cat-active').checked = cat.is_active;

        document.getElementById('course-category-form-title').innerHTML = '<i class="fas fa-edit"></i> ویرایش دسته';
    },

    resetForm() {
        const form = document.getElementById('course-category-form');
        if (form) form.reset();
        document.getElementById('course-cat-id').value = '';
        document.getElementById('course-category-form-title').innerHTML = '<i class="fas fa-plus"></i> دسته جدید';
    },

    async delete(id) {
        if (!confirm('آیا از حذف این دسته اطمینان دارید؟')) return;
        try {
            const { error } = await supabase.from('course_categories').delete().eq('id', id);
            if (error) throw error;
            this.load();
        } catch (err) {
            alert('خطا در حذف: ' + err.message);
        }
    }
};

window.CourseCategoriesModule = CourseCategoriesModule;
window.handleCourseCategorySave = (e) => CourseCategoriesModule.save(e);
window.resetCourseCategoryForm = () => CourseCategoriesModule.resetForm();
