import { supabase } from "../../../js/supabase-client.js";

/**
 * Courses Management Module - Supabase Version
 */
export const CoursesModule = {
    courses: [],

    async load() {
        try {
            // Load categories for filters and forms
            const { data: categories } = await supabase.from('course_categories').select('*').order('display_order');
            this.categories = categories || [];

            const catFilter = document.getElementById('filter-category');
            if (catFilter) {
                catFilter.innerHTML = '<option value="all">همه دسته‌ها</option>' +
                    this.categories.map(c => `<option value="${c.slug}">${c.name}</option>`).join('');
            }

            const catSelect = document.getElementById('course-form-category');
            if (catSelect) {
                catSelect.innerHTML = this.categories.map(c => `<option value="${c.slug}">${c.name}</option>`).join('');
            }

            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .order('display_order', { ascending: true });

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
            form.category.value = course.category || '';
            form.price.value = course.price || 0;
            form.discount.value = course.discount || 0;
            form.level.value = course.level || 'beginner';
            form.duration.value = course.duration || '';
            form.sessions_count.value = course.sessions_count || 1;
            form.teacher_name.value = course.teacher_name || 'مدیر دل‌کیک';
            form.display_order.value = course.display_order || 0;
            form.status.value = course.status || 'published';
            form.imageUrl.value = course.image_url || '';
            form.video_url.value = course.video_url || '';
            form.short_description.value = course.short_description || '';
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
            discount: Number(form.discount.value),
            level: form.level.value,
            duration: form.duration.value,
            sessions_count: parseInt(form.sessions_count.value) || 1,
            teacher_name: form.teacher_name.value,
            display_order: parseInt(form.display_order.value) || 0,
            status: form.status.value,
            image_url: form.imageUrl.value,
            video_url: form.video_url.value,
            short_description: form.short_description.value,
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

    translateCategory(catSlug) {
        if (!this.categories) return catSlug;
        const cat = this.categories.find(c => c.slug === catSlug);
        return cat ? cat.name : catSlug;
    },

    translateStatus(status) {
        const map = { 'published': 'منتشر شده', 'draft': 'پیش‌نویس', 'archived': 'بایگانی شده' };
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
window.handleCourseSearch = (val) => {
    const q = val.toLowerCase();
    const filtered = CoursesModule.courses.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
    );
    CoursesModule.render(filtered);
};
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

window.previewCourseImage = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const preview = document.getElementById('image-preview');
    preview.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال پردازش...';

    try {
        const { imageProcessor } = await import('../utils/image-processor.js');
        const processed = await imageProcessor.process(file, { width: 800, height: 500, watermark: true });

        const fileName = `course_${Date.now()}.webp`;
        const { data, error } = await supabase.storage.from('courses').upload(fileName, processed);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage.from('courses').getPublicUrl(fileName);
        document.querySelector('input[name="imageUrl"]').value = publicUrl;
        preview.innerHTML = `<img src="${publicUrl}" style="max-height:100%; max-width:100%; border-radius:8px;">`;
    } catch (err) {
        alert('خطا در آپلود تصویر: ' + err.message);
        preview.innerHTML = '<span>خطا در آپلود</span>';
    }
};
