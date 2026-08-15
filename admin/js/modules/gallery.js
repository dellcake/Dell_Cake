import { supabase } from "../../../js/supabase-client.js";
import { ImageProcessor } from "../utils/image-processor.js";

/**
 * Professional Gallery Management Module - Multi-Image Portfolio System
 */
export const GalleryModule = {
    items: [],
    categories: [],
    currentFilter: 'all',
    searchQuery: '',
    fileList: [], // Managed list of images for current portfolio item

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
                .select('*, gallery_categories(name), gallery_images(*)')
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
            grid.innerHTML = this.items.map(item => {
                const galleryImages = item.gallery_images || [];
                const totalImages = galleryImages.length > 0 ? galleryImages.length : (item.image_url ? 1 : 0);

                return `
                    <div class="gallery-admin-card">
                        ${item.is_featured ? '<div class="featured-star"><i class="fas fa-star"></i></div>' : ''}
                        ${totalImages > 1 ? `
                            <div style="position: absolute; top: 12px; left: 12px; background: rgba(107, 61, 42, 0.85); color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; backdrop-filter: blur(4px); z-index: 2;">
                                <i class="fas fa-images"></i> ${totalImages} تصویر
                            </div>
                        ` : ''}
                        <img src="${item.thumbnail_url || item.image_url}" class="gallery-card-img" loading="lazy" onerror="this.src='../images/logo/sweet-.png'">
                        <div class="gallery-card-info">
                            <h4>${item.title || 'بدون عنوان'}</h4>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">
                                ${item.gallery_categories?.name || 'بدون دسته'}
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
                `;
            }).join('');
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

    renderPreviewList() {
        const listContainer = document.getElementById('gallery-images-preview-list');
        const countSpan = document.getElementById('gallery-images-count');
        if (!listContainer) return;

        const activeImages = this.fileList.filter(img => !img.isDeleted);
        if (countSpan) countSpan.innerText = activeImages.length;

        if (activeImages.length === 0) {
            listContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 20px;">هیچ تصویری انتخاب نشده است.</div>';
            return;
        }

        listContainer.innerHTML = activeImages.map((img, idx) => {
            const originalIndex = this.fileList.indexOf(img);
            return `
                <div style="position: relative; border-radius: 10px; overflow: hidden; border: 2px solid ${img.isPrimary ? 'var(--primary)' : 'var(--border-color)'}; background: #fff; aspect-ratio: 1;">
                    <img src="${img.previewUrl || img.thumbnail_url || img.image_url}" style="width: 100%; height: 100%; object-fit: cover;">

                    <button type="button" onclick="GalleryModule.removeImage(${originalIndex})" style="position: absolute; top: 4px; right: 4px; background: rgba(231, 76, 60, 0.85); color: white; border: none; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; cursor: pointer;" title="حذف تصویر">
                        <i class="fas fa-times"></i>
                    </button>

                    <button type="button" onclick="GalleryModule.setPrimaryImage(${originalIndex})" style="position: absolute; bottom: 4px; right: 4px; background: ${img.isPrimary ? '#f1c40f' : 'rgba(0, 0, 0, 0.5)'}; color: ${img.isPrimary ? '#000' : '#fff'}; border: none; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; cursor: pointer;" title="${img.isPrimary ? 'تصویر کاور اصلی' : 'تنظیم به عنوان کاور اصلی'}">
                        <i class="fas fa-star"></i>
                    </button>

                    ${img.isPrimary ? `<span style="position: absolute; bottom: 4px; left: 4px; background: var(--primary); color: white; font-size: 0.6rem; padding: 1px 4px; border-radius: 4px; font-weight: bold;">کاور</span>` : ''}
                </div>
            `;
        }).join('');
    },

    removeImage(index) {
        if (index < 0 || index >= this.fileList.length) return;
        const target = this.fileList[index];

        if (target.isExisting) {
            target.isDeleted = true;
        } else {
            if (target.previewUrl && target.previewUrl.startsWith('blob:')) {
                try { URL.revokeObjectURL(target.previewUrl); } catch (_) {}
            }
            this.fileList.splice(index, 1);
        }

        // Ensure at least one remaining active image is primary
        const activeList = this.fileList.filter(img => !img.isDeleted);
        if (activeList.length > 0 && !activeList.some(img => img.isPrimary)) {
            activeList[0].isPrimary = true;
        }

        this.renderPreviewList();
    },

    setPrimaryImage(index) {
        if (index < 0 || index >= this.fileList.length) return;

        this.fileList.forEach((img, idx) => {
            img.isPrimary = (idx === index);
        });

        this.renderPreviewList();
    },

    async save(event) {
        event.preventDefault();
        console.log('--- Start Multi-Image Gallery Save Process ---');

        const id = document.getElementById('gallery-id').value;
        const saveBtn = document.getElementById('save-gallery-btn');

        const activeImages = this.fileList.filter(img => !img.isDeleted);
        if (activeImages.length === 0) {
            alert('لطفاً حداقل یک تصویر برای این نمونه‌کار انتخاب کنید.');
            return;
        }

        // Ensure one image is marked primary
        if (!activeImages.some(img => img.isPrimary)) {
            activeImages[0].isPrimary = true;
        }

        const payload = {
            title: document.getElementById('gallery-title').value,
            description: document.getElementById('gallery-description').value,
            category_id: document.getElementById('gallery-modal-category').value || null,
            alt_text: document.getElementById('gallery-alt').value,
            status: document.getElementById('gallery-status').value,
            is_featured: document.getElementById('gallery-is-featured-modal').checked,
            watermark_enabled: document.getElementById('gallery-watermark').checked
        };

        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال پردازش و ذخیره...';

        try {
            // 1. Process and upload all new files
            for (let i = 0; i < activeImages.length; i++) {
                const imgObj = activeImages[i];
                if (!imgObj.isExisting && imgObj.fileBlob) {
                    console.log(`Processing & uploading new image ${i + 1}/${activeImages.length}...`);
                    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;

                    const processedBlob = await ImageProcessor.process(imgObj.fileBlob, {
                        watermarkText: 'Dell Cake | دل‌کیک',
                        watermarkEnabled: payload.watermark_enabled
                    });
                    const thumbBlob = await ImageProcessor.generateThumbnail(imgObj.fileBlob);

                    // Upload main image
                    const { error: mainError } = await supabase.storage
                        .from('gallery')
                        .upload(`full/${fileName}`, processedBlob, { contentType: 'image/webp' });
                    if (mainError) throw mainError;

                    // Upload thumbnail
                    const { error: thumbError } = await supabase.storage
                        .from('gallery')
                        .upload(`thumbs/${fileName}`, thumbBlob, { contentType: 'image/webp' });
                    if (thumbError) throw thumbError;

                    imgObj.image_url = supabase.storage.from('gallery').getPublicUrl(`full/${fileName}`).data.publicUrl;
                    imgObj.thumbnail_url = supabase.storage.from('gallery').getPublicUrl(`thumbs/${fileName}`).data.publicUrl;
                }
            }

            // Set primary cover image for parent gallery table
            const primaryCover = activeImages.find(img => img.isPrimary) || activeImages[0];
            payload.image_url = primaryCover.image_url;
            payload.thumbnail_url = primaryCover.thumbnail_url;

            // 2. Insert or Update Parent Gallery Record
            console.log(id ? `Updating parent record ${id}...` : 'Inserting new parent record...');
            let parentId = id;

            if (id) {
                const { error: updateError } = await supabase.from('gallery').update(payload).eq('id', id);
                if (updateError) throw updateError;
            } else {
                const { data: insertData, error: insertError } = await supabase.from('gallery').insert([payload]).select();
                if (insertError) throw insertError;
                if (!insertData || insertData.length === 0) throw new Error('ثبت رکورد در پایگاه‌داده با شکست مواجه شد.');
                parentId = insertData[0].id;
            }

            // 3. Sync Child gallery_images Records
            // Delete marked existing images from DB
            const deletedExistingIds = this.fileList.filter(img => img.isExisting && img.isDeleted && img.id).map(img => img.id);
            if (deletedExistingIds.length > 0) {
                console.log('Deleting removed child images from database:', deletedExistingIds);
                const { error: delError } = await supabase.from('gallery_images').delete().in('id', deletedExistingIds);
                if (delError) console.warn('Child image delete warning:', delError);
            }

            // Insert new child images into gallery_images table
            const newChildRecords = activeImages
                .filter(img => !img.isExisting || !img.id)
                .map((img, idx) => ({
                    gallery_id: parentId,
                    image_url: img.image_url,
                    thumbnail_url: img.thumbnail_url,
                    display_order: idx
                }));

            if (newChildRecords.length > 0) {
                console.log(`Inserting ${newChildRecords.length} child images into gallery_images...`);
                const { error: childInsertError } = await supabase.from('gallery_images').insert(newChildRecords);
                if (childInsertError) console.warn('Child images insert warning:', childInsertError);
            }

            console.log('Save process completed successfully!');
            alert('با موفقیت ذخیره شد.');
            this.closeModal();
            this.fetchItems();
        } catch (err) {
            console.error('Full Multi-Image Save Error:', err);
            const errorMsg = err.message || err.error_description || err.details || (typeof err === 'string' ? err : 'Unknown upload error');
            alert('خطا در ذخیره: ' + errorMsg);
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> ذخیره در گالری';
        }
    },

    edit(id) {
        const item = this.items.find(i => i.id === id);
        if (!item) return;

        // Reset file list
        this.clearFileList();

        document.getElementById('gallery-id').value = item.id;
        document.getElementById('gallery-title').value = item.title || '';
        document.getElementById('gallery-description').value = item.description || '';
        document.getElementById('gallery-modal-category').value = item.category_id || '';
        document.getElementById('gallery-alt').value = item.alt_text || '';
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

        // Load existing images into fileList
        const galleryImages = item.gallery_images || [];
        if (galleryImages.length > 0) {
            this.fileList = galleryImages.map((gImg, idx) => ({
                id: gImg.id,
                fileBlob: null,
                fileName: `تصویر ${idx + 1}`,
                fileType: 'image/webp',
                previewUrl: gImg.thumbnail_url || gImg.image_url,
                image_url: gImg.image_url,
                thumbnail_url: gImg.thumbnail_url,
                isPrimary: gImg.image_url === item.image_url,
                isExisting: true,
                isDeleted: false
            }));
            // If none matched primary, set first as primary
            if (!this.fileList.some(img => img.isPrimary)) {
                this.fileList[0].isPrimary = true;
            }
        } else if (item.image_url) {
            this.fileList = [{
                id: null,
                fileBlob: null,
                fileName: 'تصویر اصلی',
                fileType: 'image/webp',
                previewUrl: item.thumbnail_url || item.image_url,
                image_url: item.image_url,
                thumbnail_url: item.thumbnail_url,
                isPrimary: true,
                isExisting: true,
                isDeleted: false
            }];
        }

        document.getElementById('gallery-modal-title').innerText = 'ویرایش نمونه‌کار گالری';
        document.getElementById('gallery-modal').style.display = 'flex';
        this.renderPreviewList();
    },

    async delete(id) {
        if (!confirm('آیا از حذف کامل این نمونه‌کار و تمام تصاویر آن اطمینان دارید؟')) return;
        try {
            const { error } = await supabase.from('gallery').delete().eq('id', id);
            if (error) throw error;
            this.fetchItems();
        } catch (err) {
            console.error('Delete Error:', err);
            const errorMsg = err.message || err.error_description || err.details || 'Unknown delete error';
            alert('خطا در حذف: ' + errorMsg);
        }
    },

    openModal() {
        this.clearFileList();

        document.getElementById('gallery-form').reset();
        document.getElementById('gallery-id').value = '';
        document.getElementById('gallery-image-url').value = '';
        document.getElementById('gallery-thumb-url').value = '';
        document.getElementById('gallery-code-group').style.display = 'none';
        document.getElementById('gallery-code').value = '';
        document.getElementById('gallery-modal-title').innerText = 'افزودن نمونه‌کار به گالری';
        document.getElementById('gallery-modal').style.display = 'flex';

        this.renderCategorySelect();
        this.initDragAndDrop();
        this.renderPreviewList();
    },

    closeModal() {
        this.clearFileList();
        document.getElementById('gallery-modal').style.display = 'none';
    },

    clearFileList() {
        this.fileList.forEach(img => {
            if (img.previewUrl && img.previewUrl.startsWith('blob:')) {
                try { URL.revokeObjectURL(img.previewUrl); } catch (_) {}
            }
        });
        this.fileList = [];
    },

    initDragAndDrop() {
        const dropZoneElement = document.getElementById('gallery-drop-zone');
        const inputElement = document.getElementById('gallery-file-input');

        if (!dropZoneElement || !inputElement) return;

        dropZoneElement.onclick = (e) => {
            if (e.target.tagName !== 'INPUT') {
                inputElement.click();
            }
        };

        inputElement.onchange = async (e) => {
            if (inputElement.files.length) {
                await this.handleFilesSelected(inputElement.files);
                inputElement.value = ''; // Reset input to allow selecting same files again if needed
            }
        };

        dropZoneElement.ondragover = (e) => {
            e.preventDefault();
            dropZoneElement.classList.add('drop-zone--over');
        };

        ['dragleave', 'dragend'].forEach((type) => {
            dropZoneElement.addEventListener(type, () => {
                dropZoneElement.classList.remove('drop-zone--over');
            });
        });

        dropZoneElement.ondrop = async (e) => {
            e.preventDefault();
            dropZoneElement.classList.remove('drop-zone--over');

            if (e.dataTransfer.files.length) {
                await this.handleFilesSelected(e.dataTransfer.files);
            }
        };
    },

    async handleFilesSelected(files) {
        console.log(`[GalleryModule] Handling ${files.length} selected file(s)...`);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.type.startsWith('image/')) {
                console.warn(`[GalleryModule] File ${file.name} is not an image, skipping...`);
                continue;
            }

            try {
                const buffer = await file.arrayBuffer();
                const blob = new Blob([buffer], { type: file.type });
                const previewUrl = URL.createObjectURL(blob);

                const isFirst = this.fileList.filter(f => !f.isDeleted).length === 0;

                this.fileList.push({
                    id: null,
                    fileBlob: blob,
                    fileName: file.name,
                    fileType: file.type,
                    previewUrl: previewUrl,
                    image_url: null,
                    thumbnail_url: null,
                    isPrimary: isFirst,
                    isExisting: false,
                    isDeleted: false
                });
            } catch (err) {
                console.error(`[GalleryModule] Failed to read file ${file.name}:`, err);
                alert(`خطا در خواندن فایل ${file.name}`);
            }
        }

        this.renderPreviewList();
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
        }).catch(() => {
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
    textArea.style.position = "fixed";
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
