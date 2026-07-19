import { supabase } from "./supabase-client.js";

/**
 * Premium Dynamic Homepage Banner Engine
 * Solves the crop issue using dual-layer blur framing
 * Implements Bento/Grid smart layouts and scroll-reveal animations
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

    getLayoutClass(index, total) {
        // 1st Banner: Large Hero Banner
        if (index === 0) return 'banner-hero-layout';

        // Next 2: Dual banner row (Half-width)
        if (index === 1 || index === 2) return 'banner-half-layout';

        // Next 3: Triple cards row (Third-width)
        if (index === 3 || index === 4 || index === 5) return 'banner-third-layout';

        // Next 1: Wide Banner
        if (index === 6) return 'banner-wide-layout';

        // Remaining: Smart Bento Grid
        const rem = index - 7;
        const pattern = rem % 5;
        if (pattern === 0 || pattern === 1) {
            return 'banner-half-layout';
        } else if (pattern === 2) {
            return 'banner-third-layout';
        } else {
            return 'banner-two-thirds-layout';
        }
    },

    renderBanners(banners) {
        const grid = document.getElementById('promo-banners-grid');
        if (!grid) return;

        if (banners.length === 0) {
            this.renderFallbacks();
            return;
        }

        const isMobile = window.innerWidth <= 768;

        grid.innerHTML = banners.map((banner, index) => {
            const imgUrl = (isMobile && banner.mobile_image_url) ? banner.mobile_image_url : banner.desktop_image_url;
            const layoutClass = this.getLayoutClass(index, banners.length);
            const textColor = banner.text_color || '#ffffff';
            const overlay = banner.background_overlay || 'linear-gradient(to top, rgba(107, 61, 42, 0.9) 0%, rgba(240, 24, 115, 0.25) 100%)';

            return `
                <div class="promo-banner-item ${layoutClass} reveal-on-scroll" style="--text-color: ${textColor};">
                    <!-- Blur Background to prevent blank edges for odd aspect ratios -->
                    <div class="banner-blur-bg" style="background-image: url('${imgUrl}');"></div>

                    <!-- Exact uncropped image centered -->
                    <div class="banner-img-container">
                        <img src="${imgUrl}" alt="${banner.title}" class="banner-img" loading="lazy">
                    </div>

                    <div class="promo-banner-overlay" style="background: ${overlay};"></div>

                    <div class="promo-banner-content">
                        ${banner.subtitle ? `<span class="promo-banner-subtitle">${banner.subtitle}</span>` : ''}
                        <h3 class="promo-banner-title">${banner.title}</h3>
                        ${banner.button_url ? `
                            <a href="${banner.button_url}" class="promo-banner-btn" style="color: ${textColor}; border-color: ${textColor};">
                                ${banner.button_text || 'مشاهده'}
                                <i class="fas fa-chevron-left"></i>
                            </a>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        this.initIntersectionObserver();
    },

    renderFallbacks() {
        const grid = document.getElementById('promo-banners-grid');
        if (!grid) return;

        const fallbacks = [
            {
                title: 'آکادمی تخصصی دل‌کیک',
                subtitle: 'آموزش صفر تا صد و حرفه‌ای کیک‌پزی و دکوراتوری',
                img: 'images/hero/baker-girl.png',
                url: '#',
                onclick: 'openAcademyPopup(); return false;',
                btnText: 'شروع یادگیری',
                layout: 'banner-hero-layout'
            },
            {
                title: 'سفارش کیک‌های خاص',
                subtitle: 'طراحی مینیاتوری و سفارشی با طعم رویایی',
                img: 'images/gallery/cake1.jpg',
                url: 'order-cake.html',
                btnText: 'ثبت سفارش کیک',
                layout: 'banner-half-layout'
            },
            {
                title: 'شیرینی‌های خانگی لوکس',
                subtitle: 'طعم اصیل و خانگی با بهترین مواد اولیه',
                img: 'images/gallery/cake14.jpg',
                url: 'order-cake.html',
                btnText: 'سفارش شیرینی',
                layout: 'banner-half-layout'
            },
            {
                title: 'گالری نمونه کارها',
                subtitle: 'الهام‌بخش لحظات شیرین و رویایی شما',
                img: 'images/gallery/cake4.jpg',
                url: '#gallerySection',
                btnText: 'مشاهده گالری',
                layout: 'banner-third-layout'
            }
        ];

        grid.innerHTML = fallbacks.map((f, index) => `
            <div class="promo-banner-item ${f.layout} reveal-on-scroll">
                <div class="banner-blur-bg" style="background-image: url('${f.img}');"></div>
                <div class="banner-img-container">
                    <img src="${f.img}" alt="${f.title}" class="banner-img" loading="lazy">
                </div>
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

        this.initIntersectionObserver();
    },

    initIntersectionObserver() {
        const items = document.querySelectorAll('.reveal-on-scroll');
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            items.forEach(item => observer.observe(item));
        } else {
            items.forEach(item => item.classList.add('visible'));
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    BannerEngine.init();
});
