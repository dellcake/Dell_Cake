import { supabase } from "../../../js/supabase-client.js";

/**
 * Banners Management Module - Premium Version
 */
export const BannersModule = {
    banners: [],

    async load() {
        try {
            const { data, error } = await supabase
                .from('banners')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            this.banners = data || [];
            this.render();
            this.updateBannersCount();
        } catch (error) {
            console.error('Error loading banners:', error);
            this.showToast('خطا در دریافت بنرها: ' + error.message, 'error');
        }
    },

    updateBannersCount() {
        const badge = document.getElementById('banners-count-badge');
        if (badge) {
            badge.textContent = `${this.banners.length} بنر`;
        }
    },

    render() {
        const grid = document.getElementById('banners-cards-grid');
        if (!grid) return;

        if (this.banners.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;" class="card">
                    <i class="fas fa-ad" style="font-size: 40px; color: var(--border-color); margin-bottom: 12px;"></i>
                    <p style="color: var(--text-muted); font-weight: 700;">هیچ بنری ثبت نشده است. بنر جدیدی ایجاد کنید!</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.banners.map(banner => {
            const isInactive = banner.status !== 'active';
            const bgOverlay = banner.background_overlay || 'rgba(0,0,0,0.4)';

            return `
                <div class="premium-banner-card" id="banner-card-${banner.id}">
                    <div class="premium-banner-card-preview" style="background-image: url('${banner.desktop_image_url}');">
                        <div style="position: absolute; top:0; left:0; width:100%; height:100%; background: ${bgOverlay}; z-index:1; border-radius: 20px 20px 0 0;"></div>

                        <!-- Badges -->
                        <div style="position: relative; z-index: 2; display: flex; justify-content: space-between; width: 100%; align-items: center;">
                            <span class="status-badge ${banner.status === 'active' ? 'published' : 'draft'}">
                                ${banner.status === 'active' ? 'فعال' : 'پیش‌نویس'}
                            </span>
                            <span class="status-badge" style="background: rgba(255,255,255,0.2); color: #fff; backdrop-filter: blur(4px);">
                                اولویت: ${banner.display_order}
                            </span>
                        </div>

                        <!-- Card text preview -->
                        <div style="position: relative; z-index: 2; color: ${banner.text_color || '#fff'}; text-align: right; margin-top: auto;">
                            <span style="font-size: 9px; opacity: 0.9; font-weight: 700;">${banner.subtitle || ''}</span>
                            <h4 style="font-size: 13px; font-weight: 800; margin: 2px 0 0;">${banner.title}</h4>
                        </div>
                    </div>

                    <div style="padding: 16px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <span style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 6px;">
                                <i class="fas fa-th-large"></i> چیدمان: <strong>${this.translateLayout(banner.layout_type)}</strong>
                            </span>
                            <span style="font-size: 11px; color: var(--text-muted); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                <i class="fas fa-link"></i> پیوند: <code>${banner.button_url || 'بدون لینک'}</code>
                            </span>
                        </div>

                        <!-- Actions -->
                        <div class="premium-banner-card-actions" style="margin-top: 15px; display: flex; gap: 8px;">
                            <button class="btn btn-outline" style="padding: 6px 12px; font-size: 11px; flex: 1;" onclick="BannersModule.edit('${banner.id}')">
                                <i class="fas fa-edit"></i> ویرایش
                            </button>
                            <button class="btn btn-outline" style="padding: 6px 12px; font-size: 11px;" onclick="BannersModule.duplicate('${banner.id}')" title="کپی کردن بنر">
                                <i class="fas fa-clone"></i>
                            </button>
                            <button class="btn btn-outline" style="padding: 6px 12px; font-size: 11px; color: #ff4757; border-color: rgba(255,71,87,0.15);" onclick="BannersModule.delete('${banner.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    translateLayout(layout) {
        const map = {
            'half': 'نیم‌صفحه عریض',
            'wide': 'عریض متوسط',
            'square': 'مربعی کوچک',
            'hero': 'اسلایدر هیرو بالایی',
            'full': 'تمام‌عرض بزرگ'
        };
        return map[layout] || layout;
    },

    edit(id) {
        const banner = this.banners.find(b => b.id === id);
        if (!banner) return;

        const form = document.getElementById('banner-form');
        if (!form) return;

        form.bannerId.value = banner.id;
        form.title.value = banner.title || '';
        form.subtitle.value = banner.subtitle || '';
        form.buttonText.value = banner.button_text || 'مشاهده';
        form.buttonUrl.value = banner.button_url || '';
        form.layoutType.value = banner.layout_type || 'half';
        form.bgOverlay.value = banner.background_overlay || 'rgba(0,0,0,0.4)';
        form.textColor.value = banner.text_color || '#ffffff';
        form.displayOrder.value = banner.display_order || 0;
        form.status.value = banner.status || 'active';
        form.desktopImageUrl.value = banner.desktop_image_url || '';
        form.mobileImageUrl.value = banner.mobile_image_url || '';

        document.getElementById('editor-panel-title').innerHTML = '<i class="fas fa-magic" style="color: var(--primary);"></i> ویرایش بنر';

        // Update Live Visualization
        this.updateLivePreview();
        this.showToast('اطلاعات بنر بارگذاری شد.', 'info');
    },

    async duplicate(id) {
        const banner = this.banners.find(b => b.id === id);
        if (!banner) return;

        if (!confirm(`آیا می‌خواهید یک کپی از بنر "${banner.title}" ایجاد کنید؟`)) return;

        try {
            const dupData = {
                title: `${banner.title} (کپی)`,
                subtitle: banner.subtitle,
                button_text: banner.button_text,
                button_url: banner.button_url,
                layout_type: banner.layout_type,
                background_overlay: banner.background_overlay,
                text_color: banner.text_color,
                display_order: (banner.display_order || 0) + 1,
                status: 'inactive', // Duplicate is inactive by default
                desktop_image_url: banner.desktop_image_url,
                mobile_image_url: banner.mobile_image_url
            };

            const { error } = await supabase.from('banners').insert([dupData]);
            if (error) throw error;

            this.showToast('بنر با موفقیت کپی شد.', 'success');
            this.load();
        } catch (err) {
            console.error('Error duplicating banner:', err);
            this.showToast('خطا در شبیه‌سازی بنر: ' + err.message, 'error');
        }
    },

    async save(event) {
        event.preventDefault();
        const form = event.target;
        const submitBtn = document.getElementById('save-banner-submit-btn');

        const data = {
            title: form.title.value,
            subtitle: form.subtitle.value,
            button_text: form.buttonText.value,
            button_url: form.buttonUrl.value,
            layout_type: form.layoutType.value,
            background_overlay: form.bgOverlay.value,
            text_color: form.textColor.value,
            display_order: parseInt(form.displayOrder.value) || 0,
            status: form.status.value,
            desktop_image_url: form.desktopImageUrl.value,
            mobile_image_url: form.mobileImageUrl.value || null,
        };

        if (!data.desktop_image_url) {
            this.showToast('لطفاً ابتدا تصویر پس‌زمینه بنر را انتخاب یا آپلود کنید.', 'warning');
            return;
        }

        if (submitBtn) submitBtn.disabled = true;

        const id = form.bannerId.value;
        try {
            let error;
            if (id) {
                const { error: err } = await supabase.from('banners').update(data).eq('id', id);
                error = err;
            } else {
                const { error: err } = await supabase.from('banners').insert([data]);
                error = err;
            }

            if (error) throw error;

            this.showToast('بنر با موفقیت ذخیره شد.', 'success');
            this.resetForm();
            this.load();
        } catch (err) {
            console.error('Error saving banner:', err);
            this.showToast('خطا در ذخیره‌سازی: ' + err.message, 'error');
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    },

    async delete(id) {
        if (!confirm('آیا از حذف این بنر اطمینان دارید؟ این عملیات غیرقابل بازگشت است.')) return;
        try {
            const { error } = await supabase.from('banners').delete().eq('id', id);
            if (error) throw error;

            this.showToast('بنر با موفقیت حذف شد.', 'success');
            this.load();
        } catch (err) {
            console.error('Error deleting banner:', err);
            this.showToast('خطا در حذف بنر: ' + err.message, 'error');
        }
    },

    resetForm() {
        const form = document.getElementById('banner-form');
        if (form) form.reset();

        const idInput = document.getElementById('bannerId');
        if (idInput) idInput.value = '';

        const desktopImg = document.getElementById('desktopImageUrl');
        if (desktopImg) desktopImg.value = '';

        const mobileImg = document.getElementById('mobileImageUrl');
        if (mobileImg) mobileImg.value = '';

        document.getElementById('editor-panel-title').innerHTML = '<i class="fas fa-magic" style="color: var(--primary);"></i> طراحی بنر جدید';
        this.updateLivePreview();
    },

    updateLivePreview() {
        const titleVal = document.getElementById('banner-title-input')?.value || 'عنوان اصلی بنر';
        const subtitleVal = document.getElementById('banner-subtitle-input')?.value || 'زیرعنوان بنر';
        const btnVal = document.getElementById('banner-btn-text-input')?.value || 'مشاهده';
        const bgOverlayVal = document.getElementById('banner-overlay-input')?.value || 'rgba(0,0,0,0.4)';
        const textColorVal = document.getElementById('banner-color-input')?.value || '#ffffff';
        const imgUrl = document.getElementById('desktopImageUrl')?.value;

        const liveTitle = document.getElementById('live-title');
        const liveSubtitle = document.getElementById('live-subtitle');
        const liveBtn = document.getElementById('live-btn');
        const liveOverlay = document.getElementById('live-overlay');
        const sandbox = document.querySelector('.live-banner-sandbox');

        if (liveTitle) {
            liveTitle.textContent = titleVal;
            liveTitle.style.color = textColorVal;
        }
        if (liveSubtitle) {
            liveSubtitle.textContent = subtitleVal;
            liveSubtitle.style.color = textColorVal;
        }
        if (liveBtn) {
            liveBtn.textContent = btnVal;
            liveBtn.style.color = textColorVal;
            liveBtn.style.borderColor = textColorVal;
        }
        if (liveOverlay) {
            liveOverlay.style.background = bgOverlayVal;
        }
        if (sandbox) {
            if (imgUrl) {
                sandbox.style.backgroundImage = `url('${imgUrl}')`;
            } else {
                sandbox.style.backgroundImage = "none";
                sandbox.style.backgroundColor = "#eaeaea";
            }
        }
    },

    async processAndUploadImage(file) {
        const progressContainer = document.getElementById('banner-upload-progress-container');
        const progressFill = document.getElementById('banner-progress-fill');
        const progressStep = document.getElementById('progress-step-label');
        const progressPercent = document.getElementById('progress-percent-label');
        const uploadStatusText = document.getElementById('upload-status-text');
        const submitBtn = document.getElementById('save-banner-submit-btn');

        if (progressContainer) progressContainer.style.display = 'block';
        if (submitBtn) submitBtn.disabled = true;

        const updateProgress = (step, percent) => {
            if (progressStep) progressStep.textContent = step;
            if (progressPercent) progressPercent.textContent = `${percent}%`;
            if (progressFill) progressFill.style.width = `${percent}%`;
            if (uploadStatusText) uploadStatusText.textContent = step;
        };

        try {
            // Step 1: Processing
            updateProgress('در حال بهینه‌سازی و تبدیل به WebP...', 25);
            const { imageProcessor } = await import('../utils/image-processor.js');
            const processed = await imageProcessor.process(file, { width: 1200, height: 600, watermark: false });

            // Step 2: Uploading to Storage
            updateProgress('در حال بارگذاری روی سرور سوپابیس...', 60);
            const fileName = `banner_${Date.now()}_desktop.webp`;
            const { data, error } = await supabase.storage.from('banners').upload(fileName, processed);

            if (error) throw error;

            // Step 3: Resolving Public URL
            updateProgress('در حال دریافت نشانی عمومی...', 90);
            const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(fileName);

            document.getElementById('desktopImageUrl').value = publicUrl;
            document.getElementById('mobileImageUrl').value = publicUrl; // Same fallback URL

            this.updateLivePreview();
            updateProgress('پردازش تصویر با موفقیت انجام شد ✓', 100);
            this.showToast('تصویر بنر آپلود و پردازش شد.', 'success');
        } catch (err) {
            console.error('Error processing banner image:', err);
            updateProgress('خطا در پردازش تصویر', 0);
            this.showToast('خطا در پردازش تصویر: ' + err.message, 'error');
        } finally {
            if (submitBtn) submitBtn.disabled = false;
            setTimeout(() => {
                if (progressContainer) progressContainer.style.display = 'none';
            }, 3000);
        }
    },

    showToast(msg, type = 'info') {
        if (window.showToast) {
            window.showToast(msg, type);
        } else {
            alert(msg);
        }
    }
};

// Bind to window to allow HTML click events
window.BannersModule = BannersModule;
window.resetBannerForm = () => BannersModule.resetForm();
window.saveBanner = (e) => BannersModule.save(e);
window.updateLivePreview = () => BannersModule.updateLivePreview();

window.triggerBannerDesktopUpload = () => {
    document.getElementById('banner-desktop-file')?.click();
};

window.handleBannerDesktopSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
        BannersModule.processAndUploadImage(file);
    }
};

// Bind Drag & Drop Events
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('banner-drop-zone');
    if (dropZone) {
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropZone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
            }, false);
        });

        dropZone.addEventListener('drop', (e) => {
            const file = e.dataTransfer.files[0];
            if (file) BannersModule.processAndUploadImage(file);
        }, false);
    }
});
