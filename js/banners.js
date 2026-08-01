import { supabase } from "./supabase-client.js";

/**
 * Premium Dynamic Homepage Banner Engine - Bento & Slider Hybrid
 * Supports a premium 2026 Apple-inspired Bento Grid on the homepage
 * and preserves the Swiper Slider on subpages for complete backward compatibility.
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

            const activeBanners = data || [];

            // 1. If homepage bento grid exists, render Bento layout
            if (document.getElementById('promo-banners-bento')) {
                this.renderBentoBanners(activeBanners);
            }
            // 2. If legacy swiper wrapper exists, render Carousel layout
            if (document.getElementById('promo-banners-slider-wrapper')) {
                this.renderBannersCarousel(activeBanners);
            }
        } catch (err) {
            console.error('Error loading homepage banners:', err);
            this.renderFallbacks();
        }
    },

    renderBentoBanners(banners) {
        const bentoGrid = document.getElementById('promo-banners-bento');
        if (!bentoGrid) return;

        if (banners.length === 0) {
            this.renderBentoFallbacks();
            return;
        }

        const isMobile = window.innerWidth <= 768;
        const displayBanners = banners.slice(0, 5); // 1 Large, 4 Small max

        bentoGrid.innerHTML = displayBanners.map((banner, index) => {
            const isLarge = index === 0;
            const imgUrl = (isMobile && banner.mobile_image_url) ? banner.mobile_image_url : banner.desktop_image_url;
            const textColor = banner.text_color || '#ffffff';
            const overlay = banner.background_overlay || 'linear-gradient(to top, rgba(107, 61, 42, 0.85) 0%, rgba(240, 24, 115, 0.2) 100%)';

            return `
                <div class="bento-item ${isLarge ? 'large' : ''}" style="--text-color: ${textColor};" ${banner.button_url ? `onclick="window.location.href='${banner.button_url}'"` : ''}>
                    <div class="banner-blur-bg" style="background-image: url('${imgUrl}');"></div>
                    <div class="banner-img-container">
                        <img src="${imgUrl}" alt="${banner.title}" class="banner-img" loading="lazy" onerror="this.src='images/logo/sweet-.png'">
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
    },

    renderBentoFallbacks() {
        const bentoGrid = document.getElementById('promo-banners-bento');
        if (!bentoGrid) return;

        const fallbacks = [
            {
                title: 'آکادمی تخصصی دل‌کیک',
                subtitle: 'آموزش صفر تا صد و حرفه‌ای کیک‌پزی و دکوراتوری',
                img: 'images/hero/baker-girl.png',
                url: 'academy.html',
                btnText: 'شروع یادگیری',
                isLarge: true
            },
            {
                title: 'سفارش کیک‌های خاص',
                subtitle: 'طراحی مینیاتوری با طعم رویایی',
                img: 'images/gallery/cake1.jpg',
                url: 'order-cake.html',
                btnText: 'ثبت سفارش'
            },
            {
                title: 'شیرینی‌های لوکس',
                subtitle: 'طعم اصیل و خانگی ممتاز',
                img: 'images/gallery/cake14.webp',
                url: 'order-cake.html',
                btnText: 'مشاهده شیرینی‌ها'
            },
            {
                title: 'منوی کوکی و کاپ‌کیک',
                subtitle: 'هدیه‌ای فانتزی برای مناسبت‌ها',
                img: 'images/gallery/cake15.webp',
                url: 'order-cake.html#cookie-tab',
                btnText: 'مشاهده منو'
            },
            {
                title: 'گالری نمونه کارها',
                subtitle: 'الهام‌بخش لحظات شیرین شما',
                img: 'images/gallery/cake4.jpg',
                url: 'gallery.html',
                btnText: 'مشاهده همه'
            }
        ];

        bentoGrid.innerHTML = fallbacks.map(f => `
            <div class="bento-item ${f.isLarge ? 'large' : ''}" onclick="window.location.href='${f.url}'">
                <div class="banner-blur-bg" style="background-image: url('${f.img}');"></div>
                <div class="banner-img-container">
                    <img src="${f.img}" alt="${f.title}" class="banner-img" loading="lazy" onerror="this.src='images/logo/sweet-.png'">
                </div>
                <div class="promo-banner-overlay"></div>
                <div class="promo-banner-content">
                    <span class="promo-banner-subtitle">${f.subtitle}</span>
                    <h3 class="promo-banner-title">${f.title}</h3>
                    <a href="${f.url}" class="promo-banner-btn">
                        ${f.btnText}
                        <i class="fas fa-chevron-left"></i>
                    </a>
                </div>
            </div>
        `).join('');
    },

    renderBannersCarousel(banners) {
        const wrapper = document.getElementById('promo-banners-slider-wrapper');
        if (!wrapper) return;

        if (banners.length === 0) {
            this.renderCarouselFallbacks();
            return;
        }

        const isMobile = window.innerWidth <= 768;

        wrapper.innerHTML = banners.map((banner, index) => {
            const imgUrl = (isMobile && banner.mobile_image_url) ? banner.mobile_image_url : banner.desktop_image_url;
            const textColor = banner.text_color || '#ffffff';
            const overlay = banner.background_overlay || 'linear-gradient(to top, rgba(107, 61, 42, 0.85) 0%, rgba(240, 24, 115, 0.2) 100%)';

            return `
                <div class="swiper-slide promo-banner-slide">
                    <div class="promo-banner-item" style="--text-color: ${textColor};" ${banner.button_url ? `onclick="window.location.href='${banner.button_url}'"` : ''}>
                        <div class="banner-blur-bg" style="background-image: url('${imgUrl}');"></div>
                        <div class="banner-img-container">
                            <img src="${imgUrl}" alt="${banner.title}" class="banner-img" loading="lazy" onerror="this.src='images/logo/sweet-.png'">
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
                </div>
            `;
        }).join('');

        this.initSwiper();
    },

    renderCarouselFallbacks() {
        const wrapper = document.getElementById('promo-banners-slider-wrapper');
        if (!wrapper) return;

        const fallbacks = [
            {
                title: 'آکادمی تخصصی دل‌کیک',
                subtitle: 'آموزش صفر تا صد و حرفه‌ای کیک‌پزی و دکوراتوری',
                img: 'images/hero/baker-girl.png',
                url: 'academy.html',
                btnText: 'شروع یادگیری'
            },
            {
                title: 'سفارش کیک‌های خاص',
                subtitle: 'طراحی مینیاتوری و سفارشی با طعم رویایی',
                img: 'images/gallery/cake1.jpg',
                url: 'order-cake.html',
                btnText: 'ثبت سفارش کیک'
            },
            {
                title: 'شیرینی‌های خانگی لوکس',
                subtitle: 'طعم اصیل و خانگی با بهترین مواد اولیه',
                img: 'images/gallery/cake14.webp',
                url: 'order-cake.html',
                btnText: 'سفارش شیرینی'
            },
            {
                title: 'گالری نمونه کارها',
                subtitle: 'الهام‌بخش لحظات شیرین و رویایی شما',
                img: 'images/gallery/cake4.jpg',
                url: 'gallery.html',
                btnText: 'مشاهده گالری'
            }
        ];

        wrapper.innerHTML = fallbacks.map(f => `
            <div class="swiper-slide promo-banner-slide">
                <div class="promo-banner-item" onclick="window.location.href='${f.url}'">
                    <div class="banner-blur-bg" style="background-image: url('${f.img}');"></div>
                    <div class="banner-img-container">
                        <img src="${f.img}" alt="${f.title}" class="banner-img" loading="lazy" onerror="this.src='images/logo/sweet-.png'">
                    </div>
                    <div class="promo-banner-overlay"></div>
                    <div class="promo-banner-content">
                        <span class="promo-banner-subtitle">${f.subtitle}</span>
                        <h3 class="promo-banner-title">${f.title}</h3>
                        <a href="${f.url}" class="promo-banner-btn">
                            ${f.btnText}
                            <i class="fas fa-chevron-left"></i>
                        </a>
                    </div>
                </div>
            </div>
        `).join('');

        this.initSwiper();
    },

    renderFallbacks() {
        if (document.getElementById('promo-banners-bento')) {
            this.renderBentoFallbacks();
        } else {
            this.renderCarouselFallbacks();
        }
    },

    initSwiper() {
        if (typeof Swiper !== 'undefined') {
            new Swiper('.promo-swiper', {
                loop: true,
                speed: 1000,
                effect: 'fade',
                fadeEffect: {
                    crossFade: true
                },
                autoplay: {
                    delay: 5000,
                    disableOnInteraction: false,
                },
                navigation: {
                    nextEl: '.promo-swiper-next',
                    prevEl: '.promo-swiper-prev',
                },
                pagination: {
                    el: '.promo-swiper-pagination',
                    clickable: true,
                    dynamicBullets: true
                }
            });
        } else {
            console.warn('Swiper is not loaded yet. Retrying...');
            setTimeout(() => this.initSwiper(), 200);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    BannerEngine.init();
});
