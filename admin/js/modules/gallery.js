import { supabase } from "../../../js/supabase-client.js";
import { ImageProcessor } from "../utils/image-processor.js";

/**
 * Professional Gallery Management Module
 */
export const GalleryModule = {
    items: [],
    categories: [],
    currentFilter: 'all',
    searchQuery: '',

    async load() {
        await this.loadCategories();
        await this.fetchItems();
    },

    async loadCategories() {
        try {
            const { data, error } = await supabase
                .from('gallery_categories')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            this.categories = data || [];
            this.renderCategoryFilters();
            this.renderCategorySelect();
        } catch (err) {
            console.error('Error loading categories:', err);
        }
    },

    async fetchItems() {
        try {
            let query = supabase
                .from('gallery')
                .select('*, gallery_categories(name)')
                .order('display_order', { ascending: true })
                .order('created_at', { ascending: false });

            if (this.currentFilter !== 'all') {
                query = query.eq('category_id', this.currentFilter);
            }

            if (this.searchQuery) {
                query = query.or(`title.ilike.%${this.searchQuery}%,description.ilike.%${this.searchQuery}%`);
            }

            const { data, error } = await query;

            if (error) throw error;
            this.items = data || [];
            this.render();

            const countEl = document.getElementById('total-gallery-count');
            if (countEl) countEl.innerText = `تعداد: ${this.items.length}`;
        } catch (error) {
            console.error('Error fetching gallery:', error);
        }
    },

    render() {
        const grid = document.getElementById('gallery-grid');
        if (!grid) return;

        if (this.items.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 50px; background: var(--accent); border-radius: 15px;">تصویری یافت نشد.</div>';
        } else {
            grid.innerHTML = this.items.map(item => `
                <div class="gallery-admin-card">
                    ${item.is_featured ? '<div class="featured-star"><i class="fas fa-star"></i></div>' : ''}
                    <img src="${item.thumbnail_url || item.image_url}" class="gallery-card-img" loading="lazy">
                    <div class="gallery-card-info">
                        <h4>${item.title || 'بدون عنوان'}</h4>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">
                            ${item.gallery_categories?.name || 'بدون دسته'} | ترتیب: ${item.display_order}
                        </div>
                        <div class="gallery-card-actions">
                            <span class="status-badge ${item.status === 'published' ? 'published' : 'draft'}">
                                ${item.status === 'published' ? 'منتشر شده' : 'پیش‌نویس'}
                            </span>
                            <div class="actions">
                                <button class="btn-icon" onclick="GalleryModule.edit('${item.id}')" title="ویرایش"><i class="fas fa-edit"></i></button>
                                <button class="btn-icon btn-delete" onclick="GalleryModule.delete('${item.id}')" title="حذف"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    },

    renderCategoryFilters() {
        const select = document.getElementById('gallery-category-filter');
        if (!select) return;

        const currentVal = select.value;
        select.innerHTML = '<option value="all">همه دسته‌ها</option>' +
            this.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
        select.value = currentVal;
    },

    renderCategorySelect() {
        const select = document.getElementById('gallery-modal-category');
        if (!select) return;
        select.innerHTML = '<option value="">انتخاب دسته...</option>' +
            this.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
    },

    setFilter(catId) {
        this.currentFilter = catId;
        this.fetchItems();
    },

    setSearch(query) {
        this.searchQuery = query;
        this.fetchItems();
    },

    async save(event) {
        event.preventDefault();
        const id = document.getElementById('gallery-id').value;
        const fileInput = document.getElementById('gallery-file-input');
        const saveBtn = document.getElementById('save-gallery-btn');

        const payload = {
            title: document.getElementById('gallery-title').value,
            description: document.getElementById('gallery-description').value,
            category_id: document.getElementById('gallery-modal-category').value || null,
            alt_text: document.getElementById('gallery-alt').value,
            display_order: parseInt(document.getElementById('gallery-order').value) || 0,
            status: document.getElementById('gallery-status').value,
            is_featured: document.getElementById('gallery-is-featured-modal').checked,
            watermark_enabled: document.getElementById('gallery-watermark').checked,
            image_url: document.getElementById('gallery-image-url').value,
            thumbnail_url: document.getElementById('gallery-thumb-url').value
        };

        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ذخیره...';

        try {
            // 1. If new file selected, upload it
            if (fileInput.files && fileInput.files[0]) {
                const file = fileInput.files[0];
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;

                // Process (Resizing + Watermark if enabled)
                const processedBlob = await ImageProcessor.process(file, {
                    watermarkText: 'Dell Cake | دل‌کیک',
                    watermarkEnabled: payload.watermark_enabled
                });
                const thumbBlob = await ImageProcessor.generateThumbnail(file);

                // Upload to Storage
                const { data: mainData, error: mainError } = await supabase.storage
                    .from('gallery')
                    .upload(`full/${fileName}`, processedBlob, { contentType: 'image/webp' });
                if (mainError) throw mainError;

                const { data: thumbData, error: thumbError } = await supabase.storage
                    .from('gallery')
                    .upload(`thumbs/${fileName}`, thumbBlob, { contentType: 'image/webp' });
                if (thumbError) throw thumbError;

                payload.image_url = supabase.storage.from('gallery').getPublicUrl(`full/${fileName}`).data.publicUrl;
                payload.thumbnail_url = supabase.storage.from('gallery').getPublicUrl(`thumbs/${fileName}`).data.publicUrl;
            }

            if (!payload.image_url) throw new Error('لطفاً یک تصویر انتخاب کنید.');

            // 2. Save to Database
            let error;
            if (id) {
                const { error: err } = await supabase.from('gallery').update(payload).eq('id', id);
                error = err;
            } else {
                const { error: err } = await supabase.from('gallery').insert([payload]);
                error = err;
            }

            if (error) throw error;

            alert('با موفقیت ذخیره شد.');
            this.closeModal();
            this.fetchItems();
        } catch (err) {
            console.error('Save Error:', err);
            alert('خطا در ذخیره: ' + err.message);
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> ذخیره در گالری';
        }
    },

    edit(id) {
        const item = this.items.find(i => i.id === id);
        if (!item) return;

        document.getElementById('gallery-id').value = item.id;
        document.getElementById('gallery-title').value = item.title || '';
        document.getElementById('gallery-description').value = item.description || '';
        document.getElementById('gallery-modal-category').value = item.category_id || '';
        document.getElementById('gallery-alt').value = item.alt_text || '';
        document.getElementById('gallery-order').value = item.display_order || 0;
        document.getElementById('gallery-status').value = item.status || 'published';
        document.getElementById('gallery-is-featured-modal').checked = item.is_featured || false;
        document.getElementById('gallery-watermark').checked = item.watermark_enabled ?? true;
        document.getElementById('gallery-image-url').value = item.image_url || '';
        document.getElementById('gallery-thumb-url').value = item.thumbnail_url || '';

        document.getElementById('gallery-preview').src = item.thumbnail_url || item.image_url || '../images/logo/sweet-.png';
        document.getElementById('gallery-modal-title').innerText = 'ویرایش تصویر گالری';
        document.getElementById('gallery-modal').style.display = 'flex';
    },

    async delete(id) {
        if (!confirm('آیا از حذف این تصویر اطمینان دارید؟')) return;
        try {
            const { error } = await supabase.from('gallery').delete().eq('id', id);
            if (error) throw error;
            this.fetchItems();
        } catch (err) {
            alert('خطا در حذف: ' + err.message);
        }
    },

    openModal() {
        document.getElementById('gallery-form').reset();
        document.getElementById('gallery-id').value = '';
        document.getElementById('gallery-image-url').value = '';
        document.getElementById('gallery-thumb-url').value = '';
        document.getElementById('gallery-preview').src = '../images/logo/sweet-.png';
        document.getElementById('gallery-modal-title').innerText = 'افزودن تصویر به گالری';
        document.getElementById('gallery-modal').style.display = 'flex';
    },

    closeModal() {
        document.getElementById('gallery-modal').style.display = 'none';
    }
};

window.GalleryModule = GalleryModule;
window.handleGallerySave = (e) => GalleryModule.save(e);
window.handleGallerySearch = (val) => GalleryModule.setSearch(val);
window.handleGalleryCategoryFilter = (val) => GalleryModule.setFilter(val);
window.openGalleryModal = () => GalleryModule.openModal();
window.closeGalleryModal = () => GalleryModule.closeModal();

window.previewGalleryImage = (event) => {
    const input = event.target;
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('gallery-preview').src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
};
