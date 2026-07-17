import { supabase } from "./supabase-client.js";

/**
 * Dynamic Homepage Banner Engine
 * Renders multiple banner layout blocks with fallback styling
 */
export const BannerEngine = {
    async init() {
        try {
            const { data, error } = await supabase
                .from('banners')
                .select('*')
                .eq('status', 'active')
                .order('display_order', { ascending: true });

            if (error) throw error;
            this.renderBanners(data || []);
        } catch (err) {
            console.error('Error loading homepage banners:', err);
            this.renderFallbacks();
        }
    },

    renderBanners(banners) {
        const grid = document.getElementById('promo-banners-grid');
        if (!grid) return;

        if (banners.length === 0) {
            this.renderFallbacks();
            return;
        }

        grid.innerHTML = banners.map(banner => {
            const isMobile = window.innerWidth <= 768;
            const imgUrl = (isMobile && banner.mobile_image_url) ? banner.mobile_image_url : banner.desktop_image_url;

            // Generate classes based on banner types
            let layoutClass = 'banner-half';
            if (banner.layout_type === 'wide') layoutClass = 'banner-wide';
            if (banner.layout_type === 'square') layoutClass = 'banner-square';
            if (banner.layout_type === 'hero') layoutClass = 'banner-hero';
            if (banner.layout_type === 'full') layoutClass = 'banner-full';

            return `
                <div class="promo-banner-item ${layoutClass}" style="background-image: url('${imgUrl}'); color: ${banner.text_color || '#ffffff'};">
                    <div class="promo-banner-overlay" style="background: ${banner.background_overlay || 'rgba(0,0,0,0.45)'};"></div>
                    <div class="promo-banner-content">
                        ${banner.subtitle ? `<span class="promo-banner-subtitle">${banner.subtitle}</span>` : ''}
                        <h3 class="promo-banner-title">${banner.title}</h3>
                        ${banner.button_url ? `
                            <a href="${banner.button_url}" class="promo-banner-btn" style="color: ${banner.text_color || '#ffffff'}; border-color: ${banner.text_color || '#ffffff'};">
                                ${banner.button_text || 'مشاهده'}
                                <i class="fas fa-chevron-left"></i>
                            </a>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    },

    renderFallbacks() {
        const grid = document.getElementById('promo-banners-grid');
        if (!grid) return;

        // Beautiful and highly polished luxury fallback blocks matching Dell Cake Identity
        const fallbacks = [
            {
                title: 'آکادمی دل‌کیک',
                subtitle: 'آموزش تخصصی و حرفه‌ای کیک‌پزی',
                img: 'images/hero/baker-girl.png',
                url: '#',
                onclick: 'openAcademyPopup(); return false;',
                btnText: 'شروع یادگیری',
                layout: 'banner-half'
            },
            {
                title: 'سفارش کیک‌های خاص',
                subtitle: 'طراحی مینیاتوری و سفارشی برای مجالس شما',
                img: 'images/gallery/cake1.jpg',
                url: 'order-cake.html',
                btnText: 'ثبت سفارش کیک',
                layout: 'banner-half'
            },
            {
                title: 'گالری نمونه کارها',
                subtitle: 'الهام‌بخش لحظات شیرین شما',
                img: 'images/gallery/cake4.jpg',
                url: '#gallerySection',
                btnText: 'مشاهده گالری',
                layout: 'banner-square'
            },
            {
                title: 'شیرینی‌های خانگی لوکس',
                subtitle: 'طعم اصیل و خانگی با بهترین مواد اولیه',
                img: 'images/gallery/cake14.jpg',
                url: 'order-cake.html',
                btnText: 'سفارش شیرینی',
                layout: 'banner-square'
            }
        ];

        grid.innerHTML = fallbacks.map(f => `
            <div class="promo-banner-item ${f.layout}" style="background-image: url('${f.img}');">
                <div class="promo-banner-overlay"></div>
                <div class="promo-banner-content">
                    <span class="promo-banner-subtitle">${f.subtitle}</span>
                    <h3 class="promo-banner-title">${f.title}</h3>
                    <a href="${f.url}" ${f.onclick ? `onclick="${f.onclick}"` : ''} class="promo-banner-btn">
                        ${f.btnText}
                        <i class="fas fa-chevron-left"></i>
                    </a>
                </div>
            </div>
        `).join('');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    BannerEngine.init();
});
