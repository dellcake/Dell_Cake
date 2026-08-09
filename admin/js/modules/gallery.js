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
    currentPreviewUrl: null,
    selectedFileBlob: null,
    selectedFileName: '',
    selectedFileType: '',

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
        } catch (err) {
            console.error('Error loading categories:', err);
        } finally {
            this.renderCategoryFilters();
            this.renderCategorySelect();
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
                const queryStr = this.searchQuery.trim();
                if (/^\d+$/.test(queryStr)) {
                    query = query.or(`code.eq.${queryStr},title.ilike.%${queryStr}%,description.ilike.%${queryStr}%`);
                } else {
                    query = query.or(`title.ilike.%${queryStr}%,description.ilike.%${queryStr}%`);
                }
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
                        <div style="font-size: 0.85rem; font-weight: bold; margin-top: 6px; display: flex; align-items: center; gap: 8px; color: var(--secondary);">
                            <span>کد: ${item.code || 'بدون کد'}</span>
                            ${item.code ? `
                            <button class="btn-icon" style="width: 20px; height: 20px; font-size: 0.7rem; border-radius: 4px;" onclick="copyGalleryCode('${item.code}')" title="کپی کد">
                                <i class="fas fa-copy"></i>
                            </button>
                            ` : ''}
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

        if (this.categories.length === 0) {
            select.innerHTML = '<option value="">⚠️ دسته‌بندی یافت نشد!</option>';
            // Add a small hint if empty
            const parent = select.parentElement;
            if (parent && !parent.querySelector('.empty-hint')) {
                const hint = document.createElement('small');
                hint.className = 'empty-hint';
                hint.style.color = '#e74c3c';
                hint.style.marginTop = '5px';
                hint.style.display = 'block';
                hint.innerHTML = 'ابتدا از بخش <a href="#" onclick="navigateTo(\'Categories\')" style="color: var(--primary); font-weight: bold;">مدیریت دسته‌ها</a> یک دسته بسازید.';
                parent.appendChild(hint);
            }
        } else {
            select.innerHTML = '<option value="">انتخاب دسته...</option>' +
                this.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');

            // Remove hint if categories now exist
            const hint = select.parentElement.querySelector('.empty-hint');
            if (hint) hint.remove();
        }
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
        console.log('--- Start Gallery Save Process ---');

        const id = document.getElementById('gallery-id').value;
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

        console.log('Payload prepared:', payload);

        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ذخیره...';

        try {
            // 1. If new file selected, upload it
            if (this.selectedFileBlob) {
                const file = this.selectedFileBlob;
                console.log('Selected file Blob detected for upload, size:', file.size, 'type:', file.type);

                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;

                // Process (Resizing + Watermark if enabled)
                console.log('Processing image (resizing/watermark)...');
                const processedBlob = await ImageProcessor.process(file, {
                    watermarkText: 'Dell Cake | دل‌کیک',
                    watermarkEnabled: payload.watermark_enabled
                });
                const thumbBlob = await ImageProcessor.generateThumbnail(file);
                console.log('Image processing complete.');

                // Upload to Storage
                console.log('Uploading to Storage: full/' + fileName);
                const { data: mainData, error: mainError } = await supabase.storage
                    .from('gallery')
                    .upload(`full/${fileName}`, processedBlob, { contentType: 'image/webp' });

                if (mainError) {
                    console.error('Storage Upload (Full) Failed:', mainError);
                    throw mainError;
                }

                console.log('Uploading to Storage: thumbs/' + fileName);
                const { data: thumbData, error: thumbError } = await supabase.storage
                    .from('gallery')
                    .upload(`thumbs/${fileName}`, thumbBlob, { contentType: 'image/webp' });

                if (thumbError) {
                    console.error('Storage Upload (Thumb) Failed:', thumbError);
                    throw thumbError;
                }

                payload.image_url = supabase.storage.from('gallery').getPublicUrl(`full/${fileName}`).data.publicUrl;
                payload.thumbnail_url = supabase.storage.from('gallery').getPublicUrl(`thumbs/${fileName}`).data.publicUrl;
                console.log('Storage URLs generated:', { main: payload.image_url, thumb: payload.thumbnail_url });
            }

            if (!payload.image_url) {
                console.warn('Save attempted without image URL');
                throw new Error('لطفاً یک تصویر انتخاب کنید.');
            }

            // 2. Save to Database
            console.log(id ? `Updating record ${id}...` : 'Inserting new record...');
            let dbResult;
            if (id) {
                dbResult = await supabase.from('gallery').update(payload).eq('id', id);
            } else {
                dbResult = await supabase.from('gallery').insert([payload]);
            }

            if (dbResult.error) {
                console.error('Database Operation Failed:', dbResult.error);
                throw dbResult.error;
            }

            console.log('Database operation successful.');
            alert('با موفقیت ذخیره شد.');
            this.closeModal();
            this.fetchItems();
        } catch (err) {
            console.error('Full Save Error Object:', err);
            const errorMsg = err.message || err.error_description || err.details || err.hint || (typeof err === 'string' ? err : 'Unknown upload error');
            alert('خطا در ذخیره: ' + errorMsg);
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> ذخیره در گالری';
            console.log('--- End Gallery Save Process ---');
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

        if (item.code) {
            document.getElementById('gallery-code-group').style.display = 'block';
            document.getElementById('gallery-code').value = item.code;
        } else {
            document.getElementById('gallery-code-group').style.display = 'none';
            document.getElementById('gallery-code').value = '';
        }

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
            console.error('Delete Error:', err);
            const errorMsg = err.message || err.error_description || err.details || err.hint || 'Unknown delete error';
            alert('خطا در حذف: ' + errorMsg);
        }
    },

    openModal() {
        this.selectedFileBlob = null;
        this.selectedFileName = '';
        this.selectedFileType = '';

        document.getElementById('gallery-form').reset();
        document.getElementById('gallery-id').value = '';
        document.getElementById('gallery-image-url').value = '';
        document.getElementById('gallery-thumb-url').value = '';
        document.getElementById('gallery-code-group').style.display = 'none';
        document.getElementById('gallery-code').value = '';
        document.getElementById('gallery-preview').src = '../images/logo/sweet-.png';
        document.getElementById('gallery-modal-title').innerText = 'افزودن تصویر به گالری';
        document.getElementById('gallery-modal').style.display = 'flex';

        this.renderCategorySelect();
        this.initDragAndDrop();
    },

    closeModal() {
        this.selectedFileBlob = null;
        this.selectedFileName = '';
        this.selectedFileType = '';
        document.getElementById('gallery-modal').style.display = 'none';
    },

    initDragAndDrop() {
        const dropZoneElement = document.getElementById('gallery-drop-zone');
        const inputElement = document.getElementById('gallery-file-input');

        if (!dropZoneElement || !inputElement) return;

        dropZoneElement.addEventListener('click', (e) => {
            inputElement.click();
        });

        inputElement.addEventListener('change', async (e) => {
            if (inputElement.files.length) {
                await this.updateThumbnail(dropZoneElement, inputElement.files[0]);
            }
        });

        dropZoneElement.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZoneElement.classList.add('drop-zone--over');
        });

        ['dragleave', 'dragend'].forEach((type) => {
            dropZoneElement.addEventListener(type, (e) => {
                dropZoneElement.classList.remove('drop-zone--over');
            });
        });

        dropZoneElement.addEventListener('drop', async (e) => {
            e.preventDefault();

            if (e.dataTransfer.files.length) {
                inputElement.files = e.dataTransfer.files;
                await this.updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
            }

            dropZoneElement.classList.remove('drop-zone--over');
        });
    },

    async updateThumbnail(dropZoneElement, file) {
        let thumbnailElement = dropZoneElement.querySelector('.drop-zone__thumb');

        // First time - remove the prompt
        if (dropZoneElement.querySelector('.drop-zone__prompt')) {
            dropZoneElement.querySelector('.drop-zone__prompt').style.display = 'none';
        }

        if (!thumbnailElement) {
            thumbnailElement = document.createElement('div');
            thumbnailElement.classList.add('drop-zone__thumb');
            dropZoneElement.appendChild(thumbnailElement);
        }

        thumbnailElement.dataset.label = file.name;

        // Immediately read the file into an in-memory persistent Blob to prevent file descriptor expiration on mobile
        try {
            console.log('[GalleryModule] Instantly reading selected file into an ArrayBuffer...');
            const buffer = await file.arrayBuffer();
            this.selectedFileBlob = new Blob([buffer], { type: file.type });
            this.selectedFileName = file.name;
            this.selectedFileType = file.type;
            console.log('[GalleryModule] File converted to persistent Blob successfully:', this.selectedFileBlob.size, 'bytes');
        } catch (err) {
            console.error('[GalleryModule] Failed to read selected file into memory Blob:', err);
            alert('خطا در خواندن فایل تصویر از دستگاه. لطفاً دوباره تلاش کنید.');
            return;
        }

        // Show thumbnail for image files
        if (file.type.startsWith('image/')) {
            // Revoke old object URL to prevent memory leaks
            if (GalleryModule.currentPreviewUrl) {
                try {
                    URL.revokeObjectURL(GalleryModule.currentPreviewUrl);
                } catch (e) {
                    console.warn('Revoke object URL failed:', e);
                }
            }

            // Create new object URL from our persistent Blob instead of the original File object
            GalleryModule.currentPreviewUrl = URL.createObjectURL(this.selectedFileBlob);

            thumbnailElement.style.backgroundImage = `url('${GalleryModule.currentPreviewUrl}')`;
            document.getElementById('gallery-preview').src = GalleryModule.currentPreviewUrl;
        } else {
            thumbnailElement.style.backgroundImage = null;
        }
    }
};

window.GalleryModule = GalleryModule;
window.handleGallerySave = (e) => GalleryModule.save(e);
window.handleGallerySearch = (val) => GalleryModule.setSearch(val);
window.handleGalleryCategoryFilter = (val) => GalleryModule.setFilter(val);
window.openGalleryModal = () => GalleryModule.openModal();
window.closeGalleryModal = () => GalleryModule.closeModal();

window.copyGalleryCode = (code) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(() => {
            alert('کد تصویر کپی شد: ' + code);
        }).catch(err => {
            fallbackCopyText(code);
        });
    } else {
        fallbackCopyText(code);
    }
};

window.copyGalleryCodeFromModal = () => {
    const code = document.getElementById('gallery-code').value;
    if (code) {
        window.copyGalleryCode(code);
    }
};

function fallbackCopyText(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";  // avoid scrolling to bottom
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        alert('کد تصویر کپی شد: ' + text);
    } catch (err) {
        console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
}
