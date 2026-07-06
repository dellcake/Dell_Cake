import { supabase } from "../../../js/supabase-client.js";

/**
 * Courses Management Module
 */
export const CoursesModule = {
    courses: [],

    async load() {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching courses:', error);
            return;
        }
        this.courses = data;
        this.render();
    },

    render() {
        const tbody = document.getElementById('courses-tbody');
        if (!tbody) return;

        if (this.courses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">دوره ای یافت نشد.</td></tr>';
        } else {
            tbody.innerHTML = this.courses.map(course => `
                <tr>
                    <td><img src="${course.image_url || '../images/logo/sweet-.png'}" width="50" height="50" style="border-radius:8px; object-fit:cover;"></td>
                    <td>${course.title}</td>
                    <td>${Number(course.price).toLocaleString('fa-IR')} تومان</td>
                    <td>${this.translateCategory(course.category)}</td>
                    <td><span class="status-badge ${course.status || 'published'}">${this.translateStatus(course.status || 'published')}</span></td>
                    <td>
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
            form.title.value = course.title;
            form.slug.value = course.slug;
            form.category.value = course.category;
            form.price.value = course.price;
            form.status.value = course.status;
            form.imageUrl.value = course.image_url;
            form.description.value = course.description || '';
            form.packageContent.value = Array.isArray(course.package_content) ? course.package_content.join('\n') : '';
        } else {
            form.reset();
            form.courseId.value = '';
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
            updated_at: new Date().toISOString()
        };

        const id = form.courseId.value;
        try {
            if (id) {
                await supabase.from('courses').update(data).eq('id', id);
            } else {
                await supabase.from('courses').insert([{ ...data, created_at: new Date().toISOString() }]);
            }
            document.getElementById('course-modal').style.display = 'none';
            this.load();
        } catch (err) {
            alert('خطا در ذخیره اطلاعات: ' + err.message);
        }
    },

    async delete(id) {
        if (!confirm('آیا از حذف این دوره اطمینان دارید؟')) return;
        await supabase.from('courses').delete().eq('id', id);
        this.load();
    },

    translateCategory(cat) {
        const map = { 'cake': 'کیک', 'pastry': 'شیرینی', 'dessert': 'دسر' };
        return map[cat] || cat;
    },

    translateStatus(status) {
        const map = { 'published': 'منتشر شده', 'draft': 'پیش‌نویس' };
        return map[status] || status;
    }
};

window.CoursesModule = CoursesModule;
window.saveCourse = (e) => CoursesModule.save(e);
window.openCourseModal = (id) => CoursesModule.openModal(id);
window.closeCourseModal = () => document.getElementById('course-modal').style.display = 'none';
