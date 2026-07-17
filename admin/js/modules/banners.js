import { supabase } from "../../../js/supabase-client.js";

/**
 * Banners Management Module - Professional Version
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
        } catch (error) {
            console.error('Error fetching banners:', error);
            this.render();
        }
    },

    render(filteredBanners = null) {
        const tbody = document.getElementById('banners-tbody');
        if (!tbody) return;

        const displayBanners = filteredBanners || this.banners;

        if (displayBanners.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">بنری یافت نشد.</td></tr>';
        } else {
            tbody.innerHTML = displayBanners.map(banner => `
                <tr>
                    <td data-label="تصویر"><img src="${banner.desktop_image_url}" width="70" height="40" style="border-radius:6px; object-fit:cover;"></td>
                    <td data-label="عنوان">
                        <strong>${banner.title}</strong>
                        ${banner.subtitle ? `<br><small style="color:var(--text-muted)">${banner.subtitle}</small>` : ''}
                    </td>
                    <td data-label="چیدمان"><span class="status-badge" style="background:var(--bg-light); color:var(--text);">${this.translateLayout(banner.layout_type)}</span></td>
                    <td data-label="ترتیب">${banner.display_order}</td>
                    <td data-label="وضعیت"><span class="status-badge ${banner.status === 'active' ? 'published' : 'draft'}">${banner.status === 'active' ? 'فعال' : 'غیرفعال'}</span></td>
                    <td data-label="عملیات">
                        <div class="actions">
                            <button class="btn-icon btn-edit" onclick="BannersModule.openModal('${banner.id}')"><i class="fa-solid fa-edit"></i></button>
                            <button class="btn-icon btn-delete" onclick="BannersModule.delete('${banner.id}')"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    },

    openModal(id = null) {
        const modal = document.getElementById('banner-modal');
        const form = document.getElementById('banner-form');
        if (!modal || !form) return;

        if (id) {
            const banner = this.banners.find(b => b.id === id);
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

            const desktopPreview = document.getElementById('desktop-image-preview');
            const mobilePreview = document.getElementById('mobile-image-preview');

            if (desktopPreview) {
                desktopPreview.innerHTML = banner.desktop_image_url ? `<img src="${banner.desktop_image_url}" style="max-height:100%; max-width:100%; border-radius:8px;">` : '<span>تصویر دسکتاپ</span>';
            }
            if (mobilePreview) {
                mobilePreview.innerHTML = banner.mobile_image_url ? `<img src="${banner.mobile_image_url}" style="max-height:100%; max-width:100%; border-radius:8px;">` : '<span>تصویر موبایل (اختیاری)</span>';
            }
        } else {
            form.reset();
            form.bannerId.value = '';
            document.getElementById('desktop-image-preview').innerHTML = '<span>تصویر دسکتاپ</span>';
            document.getElementById('mobile-image-preview').innerHTML = '<span>تصویر موبایل (اختیاری)</span>';
        }
        modal.style.display = 'flex';
    },

    async save(event) {
        event.preventDefault();
        const form = event.target;
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
            alert('لطفاً تصویر دسکتاپ بنر را آپلود کنید.');
            return;
        }

        const id = form.bannerId.value;
        try {
            if (id) {
                const { error } = await supabase.from('banners').update(data).eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('banners').insert([data]);
                if (error) throw error;
            }
            document.getElementById('banner-modal').style.display = 'none';
            this.load();
        } catch (err) {
            alert('خطا در ذخیره بنر: ' + err.message);
        }
    },

    async delete(id) {
        if (!confirm('آیا از حذف این بنر اطمینان دارید؟')) return;
        try {
            const { error } = await supabase.from('banners').delete().eq('id', id);
            if (error) throw error;
            this.load();
        } catch (err) {
            alert('خطا در حذف بنر: ' + err.message);
        }
    },

    translateLayout(layout) {
        const map = {
            'wide': 'کامل عریض',
            'half': 'نیمه عریض (نصف)',
            'square': 'مربعی',
            'hero': 'اسلایدر هیرو',
            'full': 'تمام صفحه پیشرفته'
        };
        return map[layout] || layout;
    },

    async uploadImage(event, targetFieldName, previewId) {
        const file = event.target.files[0];
        if (!file) return;

        const preview = document.getElementById(previewId);
        preview.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال پردازش...';

        try {
            const { imageProcessor } = await import('../utils/image-processor.js');
            const processed = await imageProcessor.process(file, { width: 1200, height: 600, watermark: false });

            const fileName = `banner_${Date.now()}_${targetFieldName}.webp`;
            const { data, error } = await supabase.storage.from('banners').upload(fileName, processed);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(fileName);
            document.querySelector(`input[name="${targetFieldName}"]`).value = publicUrl;
            preview.innerHTML = `<img src="${publicUrl}" style="max-height:100%; max-width:100%; border-radius:8px;">`;
        } catch (err) {
            alert('خطا در آپلود تصویر: ' + err.message);
            preview.innerHTML = '<span>خطا در آپلود</span>';
        }
    }
};

window.BannersModule = BannersModule;
window.openBannerModal = (id) => BannersModule.openModal(id);
window.closeBannerModal = () => document.getElementById('banner-modal').style.display = 'none';
window.saveBanner = (e) => BannersModule.save(e);
window.uploadBannerImage = (e, field, preview) => BannersModule.uploadImage(e, field, preview);
