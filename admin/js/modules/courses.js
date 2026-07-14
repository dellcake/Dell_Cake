import { supabase } from "../../../js/supabase-client.js";

/**
 * Courses Management Module - Supabase Version
 */
export const CoursesModule = {
    courses: [],

    async load() {
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            this.courses = data || [];
            this.render();
        } catch (error) {
            console.error('Error fetching courses:', error);
            this.render();
        }
    },

    render(filteredCourses = null) {
        const tbody = document.getElementById('courses-tbody');
        if (!tbody) return;

        const displayCourses = filteredCourses || this.courses;

        if (displayCourses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">دوره ای یافت نشد.</td></tr>';
        } else {
            tbody.innerHTML = displayCourses.map(course => `
                <tr>
                    <td data-label="تصویر"><img src="${course.image_url || '../images/logo/sweet-.png'}" width="50" height="50" style="border-radius:8px; object-fit:cover;"></td>
                    <td data-label="عنوان">${course.title}</td>
                    <td data-label="قیمت">${Number(course.price).toLocaleString('fa-IR')} تومان</td>
                    <td data-label="دسته‌بندی">${this.translateCategory(course.category)}</td>
                    <td data-label="وضعیت"><span class="status-badge ${course.status || 'published'}">${this.translateStatus(course.status || 'published')}</span></td>
                    <td data-label="عملیات">
                        <div class="actions">
                            <button class="btn-icon btn-edit" onclick="CoursesModule.openModal('${course.id}')"><i class="fa-solid fa-edit"></i></button>
                            <button class="btn-icon btn-delete" onclick="CoursesModule.delete('${course.id}')"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    },

    openModal(id = null) {
        const modal = document.getElementById('course-modal');
        const form = document.getElementById('course-form');
        if (!modal || !form) return;

        if (id) {
            const course = this.courses.find(c => c.id === id);
            form.courseId.value = course.id;
            form.title.value = course.title || '';
            form.slug.value = course.slug || '';
            form.category.value = course.category || 'cake';
            form.price.value = course.price || 0;
            form.status.value = course.status || 'published';
            form.imageUrl.value = course.image_url || '';
            form.description.value = course.description || '';
            form.packageContent.value = Array.isArray(course.package_content) ? course.package_content.join('\n') : (course.package_content || '');

            const preview = document.getElementById('image-preview');
            if (preview) {
                preview.innerHTML = course.image_url ? `<img src="${course.image_url}" style="max-height:100%; max-width:100%; border-radius:8px;">` : '<span>پیش‌نمایش تصویر</span>';
            }
        } else {
            form.reset();
            form.courseId.value = '';
            const preview = document.getElementById('image-preview');
            if (preview) preview.innerHTML = '<span>پیش‌نمایش تصویر</span>';
        }
        modal.style.display = 'flex';
    },

    async save(event) {
        event.preventDefault();
        const form = event.target;
        const data = {
            title: form.title.value,
            slug: form.slug.value,
            category: form.category.value,
            price: Number(form.price.value),
            status: form.status.value,
            image_url: form.imageUrl.value,
            description: form.description.value,
            package_content: form.packageContent.value.split('\n').filter(i => i.trim()),
        };

        const id = form.courseId.value;
        try {
            if (id) {
                const { error } = await supabase.from('courses').update(data).eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('courses').insert([data]);
                if (error) throw error;
            }
            document.getElementById('course-modal').style.display = 'none';
            this.load();
        } catch (err) {
            alert('خطا در ذخیره اطلاعات: ' + err.message);
        }
    },

    async delete(id) {
        if (!confirm('آیا از حذف این دوره اطمینان دارید؟')) return;
        try {
            const { error } = await supabase.from('courses').delete().eq('id', id);
            if (error) throw error;
            this.load();
        } catch (err) {
            alert('خطا در حذف: ' + err.message);
        }
    },

    translateCategory(cat) {
        const map = { 'cake': 'کیک', 'pastry': 'شیرینی', 'dessert': 'دسر' };
        return map[cat] || cat;
    },

    translateStatus(status) {
        const map = { 'published': 'منتشر شده', 'draft': 'پیش‌نویس' };
        return map[status] || status;
    },

    handleFilter() {
        const cat = document.getElementById('filter-category').value;
        const status = document.getElementById('filter-status').value;

        let filtered = this.courses;
        if (cat !== 'all') filtered = filtered.filter(c => c.category === cat);
        if (status !== 'all') filtered = filtered.filter(c => c.status === status);

        this.render(filtered);
    }
};

window.CoursesModule = CoursesModule;
window.handleCourseFilter = () => CoursesModule.handleFilter();
window.saveCourse = (e) => CoursesModule.save(e);
window.openCourseModal = (id) => CoursesModule.openModal(id);
window.closeCourseModal = () => document.getElementById('course-modal').style.display = 'none';

window.switchFormTab = (tab) => {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById(`tab-${tab}`).classList.add('active');
};

window.generateSlug = (text) => {
    const slug = text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const slugInput = document.querySelector('input[name="slug"]');
    if (slugInput && !slugInput.value) slugInput.value = slug;
};
