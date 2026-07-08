import { supabase } from "../../../js/supabase-client.js";
import { ImageProcessor } from "../utils/image-processor.js";

/**
 * Enhanced Gallery Management Module
 */
export const GalleryModule = {
    items: [],
    categories: [],
    currentFilter: 'all',

    async load() {
        await this.loadCategories();
        try {
            let query = supabase
                .from('gallery')
                .select('*, gallery_categories(name)')
                .order('created_at', { ascending: false });

            if (this.currentFilter !== 'all') {
                query = query.eq('category', this.currentFilter);
            }

            const { data, error } = await query;

            if (error) throw error;
            this.items = data || [];
            this.render();
        } catch (error) {
            console.error('Error fetching gallery:', error);
            this.render();
        }
    },

    async loadCategories() {
        try {
            const { data, error } = await supabase
                .from('gallery_categories')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            this.categories = data || [];
            this.renderFilterButtons();
            this.renderCategorySelect();
        } catch (err) {
            console.error('Error loading categories:', err);
        }
    },

    render() {
        const grid = document.getElementById('gallery-grid');
        if (!grid) return;

        if (this.items.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-muted);">تصویری در این دسته موجود نیست.</p>';
        } else {
            grid.innerHTML = this.items.map(item => `
                <div class="gallery-item" onclick="openLightbox('${item.url}', '${item.title || ''}')">
                    <img src="${item.thumbnail_url || item.url}" alt="${item.alt_text || ''}" loading="lazy">
                    <span class="category-badge">${item.gallery_categories?.name || item.category || 'سایر'}</span>
                    <div class="gallery-item-overlay">
                        <div style="text-align: center;">
                            <h4 style="color: white; margin-bottom: 10px;">${item.title || ''}</h4>
                            <button class="btn-delete-image" onclick="event.stopPropagation(); GalleryModule.delete('${item.id}', '${item.url}')">
                                <i class="fas fa-trash"></i> حذف
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    },

    renderFilterButtons() {
        const container = document.getElementById('admin-gallery-filters');
        if (!container) return;

        container.innerHTML = `
            <button class="btn btn-outline btn-sm filter-btn ${this.currentFilter === 'all' ? 'active' : ''}" onclick="GalleryModule.setFilter('all')">همه</button>
            ${this.categories.map(cat => `
                <button class="btn btn-outline btn-sm filter-btn ${this.currentFilter === cat.slug ? 'active' : ''}" onclick="GalleryModule.setFilter('${cat.slug}')">${cat.name}</button>
            `).join('')}
        `;
    },

    renderCategorySelect() {
        const select = document.getElementById('gallery-upload-category');
        if (!select) return;
        select.innerHTML = this.categories.map(cat => `<option value="${cat.slug}" data-id="${cat.id}">${cat.name}</option>`).join('') + '<option value="other">سایر</option>';
    },

    setFilter(slug) {
        this.currentFilter = slug;
        this.load();
    },

    async handleUpload() {
        const fileInput = document.getElementById('gallery-file-input');
        const categorySelect = document.getElementById('gallery-upload-category');
        const uploadBtn = document.getElementById('upload-gallery-btn');
        const isFeatured = document.getElementById('gallery-is-featured')?.checked || false;

        if (!fileInput.files || fileInput.files.length === 0) {
            alert('لطفاً یک تصویر انتخاب کنید.');
            return;
        }

        const file = fileInput.files[0];
        const categorySlug = categorySelect.value;
        const categoryId = categorySelect.options[categorySelect.selectedIndex].dataset.id;

        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال پردازش...';

        try {
            // 1. Process Image (Resize + Watermark + WebP)
            const processedBlob = await ImageProcessor.process(file);
            const thumbBlob = await ImageProcessor.generateThumbnail(file);

            // 2. Upload to Supabase Storage
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;

            // Upload main image
            const { data: mainData, error: mainError } = await supabase.storage
                .from('gallery')
                .upload(`full/${fileName}`, processedBlob, { contentType: 'image/webp' });

            if (mainError) throw mainError;

            // Upload thumbnail
            const { data: thumbData, error: thumbError } = await supabase.storage
                .from('gallery')
                .upload(`thumbs/${fileName}`, thumbBlob, { contentType: 'image/webp' });

            if (thumbError) throw thumbError;

            // 3. Get Public URLs
            const mainUrl = supabase.storage.from('gallery').getPublicUrl(`full/${fileName}`).data.publicUrl;
            const thumbUrl = supabase.storage.from('gallery').getPublicUrl(`thumbs/${fileName}`).data.publicUrl;

            // 4. Save to Database
            const { error: dbError } = await supabase.from('gallery').insert([{
                url: mainUrl,
                thumbnail_url: thumbUrl,
                category: categorySlug,
                category_id: categoryId,
                is_featured: isFeatured,
                status: 'published',
                title: file.name.split('.')[0], // Default title
                alt_text: `Dell Cake - ${categorySlug}`
            }]);

            if (dbError) throw dbError;

            alert('تصویر با موفقیت آپلود شد.');
            fileInput.value = '';
            document.getElementById('gallery-preview-container').style.display = 'none';
            this.load();

        } catch (err) {
            console.error('Upload Error:', err);
            alert('خطا در آپلود: ' + err.message);
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = '<i class="fas fa-upload"></i> آپلود تصویر';
        }
    },

    async delete(id, url) {
        if (!confirm('آیا از حذف این تصویر اطمینان دارید؟')) return;

        try {
            // 1. Delete from DB
            const { error: dbError } = await supabase.from('gallery').delete().eq('id', id);
            if (dbError) throw dbError;

            // 2. Delete from Storage (Optional, recommended)
            // Path extraction from URL might be needed if you want to clean up storage

            this.load();
        } catch (err) {
            alert('خطا در حذف: ' + err.message);
        }
    }
};

// Global handlers for the HTML
window.GalleryModule = GalleryModule;
window.handleGalleryUpload = () => GalleryModule.handleUpload();

window.previewGalleryImage = (event) => {
    const input = event.target;
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('gallery-upload-preview');
            preview.src = e.target.result;
            document.getElementById('gallery-preview-container').style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
};

window.openLightbox = (url, title) => {
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const caption = document.getElementById('lightbox-caption');
    img.src = url;
    caption.innerText = title;
    lb.style.display = 'flex';
};

window.closeLightbox = () => {
    document.getElementById('lightbox').style.display = 'none';
};

window.filterGallery = (slug) => GalleryModule.setFilter(slug);
