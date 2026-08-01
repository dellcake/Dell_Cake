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

    renderBanners(banners) {
        const wrapper = document.getElementById('promo-banners-slider-wrapper');
        if (!wrapper) return;

        if (banners.length === 0) {
            this.renderFallbacks();
            return;
        }

        const isMobile = window.innerWidth <= 768;

        wrapper.innerHTML = banners.map((banner, index) => {
            const imgUrl = (isMobile && banner.mobile_image_url) ? banner.mobile_image_url : banner.desktop_image_url;
            const textColor = banner.text_color || '#ffffff';
            const overlay = banner.background_overlay || 'linear-gradient(to top, rgba(107, 61, 42, 0.85) 0%, rgba(240, 24, 115, 0.2) 100%)';

            return `
                <div class="swiper-slide promo-banner-slide">
                    <div class="promo-banner-item" style="--text-color: ${textColor};">
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
                </div>
            `;
        }).join('');

        this.initSwiper();
    },

    renderFallbacks() {
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
                img: 'images/gallery/cake14.jpg',
                url: 'order-cake.html',
                btnText: 'سفارش شیرینی'
            },
            {
                title: 'گالری نمونه کارها',
                subtitle: 'الهام‌بخش لحظات شیرین و رویایی شما',
                img: 'images/gallery/cake4.jpg',
                url: '#gallerySection',
                btnText: 'مشاهده گالری'
            }
        ];

        wrapper.innerHTML = fallbacks.map(f => `
            <div class="swiper-slide promo-banner-slide">
                <div class="promo-banner-item">
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
            </div>
        `).join('');

        this.initSwiper();
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
