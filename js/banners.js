import { supabase } from "./supabase-client.js";

/**
 * Premium Distributed Landing Page Banner Engine
 * Distributes banners across desktop landing slots,
 * and collapses them into a modern swipeable Carousel on Mobile.
 * Absolutely prevents image cropping using dual-layer blur rendering.
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

            const banners = data || [];
            if (banners.length === 0) {
                this.render(this.getFallbacks());
            } else {
                this.render(banners);
            }
        } catch (err) {
            console.error('Error loading homepage banners:', err);
            this.render(this.getFallbacks());
        }
    },

    getFallbacks() {
        return [
            {
                title: 'آکادمی تخصصی دل‌کیک',
                subtitle: 'آموزش صفر تا صد و حرفه‌ای کیک‌پزی و دکوراتوری',
                desktop_image_url: 'images/hero/baker-girl.png',
                mobile_image_url: 'images/hero/baker-girl.png',
                button_url: '#',
                button_text: 'شروع یادگیری',
                onclick_js: 'openAcademyPopup(); return false;',
                text_color: '#ffffff',
                background_overlay: 'linear-gradient(to top, rgba(107, 61, 42, 0.95) 0%, rgba(240, 24, 115, 0.3) 100%)'
            },
            {
                title: 'سفارش کیک‌های خاص و سفارشی',
                subtitle: 'طراحی مینیاتوری و مگا کیک با طعم‌های رویایی',
                desktop_image_url: 'images/gallery/cake1.jpg',
                mobile_image_url: 'images/gallery/cake1.jpg',
                button_url: 'order-cake.html',
                button_text: 'ثبت سفارش کیک',
                text_color: '#ffffff',
                background_overlay: 'linear-gradient(to top, rgba(107, 61, 42, 0.95) 0%, rgba(240, 24, 115, 0.3) 100%)'
            },
            {
                title: 'شیرینی‌های خانگی لوکس',
                subtitle: 'طعم اصیل و نوستالژیک با بهترین مواد اولیه',
                desktop_image_url: 'images/gallery/cake14.jpg',
                mobile_image_url: 'images/gallery/cake14.jpg',
                button_url: 'order-cake.html',
                button_text: 'سفارش شیرینی',
                text_color: '#ffffff',
                background_overlay: 'linear-gradient(to top, rgba(107, 61, 42, 0.95) 0%, rgba(240, 24, 115, 0.3) 100%)'
            },
            {
                title: 'گالری نمونه کارهای دوست‌داشتنی',
                subtitle: 'الهام‌بخش لحظات شیرین و خاطره‌انگیز شما',
                desktop_image_url: 'images/gallery/cake4.jpg',
                mobile_image_url: 'images/gallery/cake4.jpg',
                button_url: '#gallerySection',
                button_text: 'مشاهده گالری',
                text_color: '#ffffff',
                background_overlay: 'linear-gradient(to top, rgba(107, 61, 42, 0.95) 0%, rgba(240, 24, 115, 0.3) 100%)'
            }
        ];
    },

    render(banners) {
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            this.renderMobileCarousel(banners);
        } else {
            this.renderDesktopDistributed(banners);
        }

        this.initIntersectionObserver();
        this.initTiltEffect();
    },

    createBannerHTML(banner, isMobileMode = false) {
        const imgUrl = (isMobileMode && banner.mobile_image_url) ? banner.mobile_image_url : banner.desktop_image_url;
        const textColor = banner.text_color || '#ffffff';
        const overlay = banner.background_overlay || 'linear-gradient(to top, rgba(107, 61, 42, 0.95) 0%, rgba(240, 24, 115, 0.3) 100%)';
        const clickAttr = banner.onclick_js ? `onclick="${banner.onclick_js}"` : '';

        return `
            <div class="landing-banner-card reveal-on-scroll" style="--text-color: ${textColor};" data-tilt>
                <!-- Double-Layer Absolute Crop Fix -->
                <div class="banner-blur-bg" style="background-image: url('${imgUrl}');"></div>

                <div class="banner-img-container">
                    <img src="${imgUrl}" alt="${banner.title}" class="banner-img" loading="lazy">
                </div>

                <div class="promo-banner-overlay" style="background: ${overlay};"></div>

                <div class="promo-banner-content">
                    ${banner.subtitle ? `<span class="promo-banner-subtitle">${banner.subtitle}</span>` : ''}
                    <h3 class="promo-banner-title">${banner.title}</h3>
                    ${banner.button_url ? `
                        <a href="${banner.button_url}" ${clickAttr} class="promo-banner-btn" style="color: ${textColor}; border-color: ${textColor};">
                            ${banner.button_text || 'مشاهده'}
                            <i class="fas fa-chevron-left"></i>
                        </a>
                    ` : ''}
                </div>
            </div>
        `;
    },

    renderMobileCarousel(banners) {
        // Clear all desktop placeholders first
        for (let i = 1; i <= 4; i++) {
            const slot = document.getElementById(`banner-slot-${i}`);
            if (slot) slot.innerHTML = '';
        }

        const container = document.getElementById('mobile-banner-carousel-container');
        const wrapper = document.getElementById('mobile-banner-swiper-wrapper');
        if (!container || !wrapper) return;

        container.style.display = 'block';

        wrapper.innerHTML = banners.map(banner => {
            return `
                <div class="swiper-slide">
                    ${this.createBannerHTML(banner, true)}
                </div>
            `;
        }).join('');

        // Initialize Swiper for Mobile
        if (window.Swiper) {
            new window.Swiper('.mobile-banner-swiper', {
                effect: 'cards',
                grabCursor: true,
                loop: true,
                autoplay: {
                    delay: 4000,
                    disableOnInteraction: false,
                },
                pagination: {
                    el: '.mobile-banner-pagination',
                    clickable: true,
                },
            });
        }
    },

    renderDesktopDistributed(banners) {
        const container = document.getElementById('mobile-banner-carousel-container');
        if (container) container.style.display = 'none';

        // Distribute banners sequentially into slots 1-4
        for (let i = 1; i <= 4; i++) {
            const slot = document.getElementById(`banner-slot-${i}`);
            if (!slot) continue;

            const banner = banners[i - 1];
            if (banner) {
                slot.innerHTML = this.createBannerHTML(banner, false);
                slot.style.display = 'block';
            } else {
                slot.style.display = 'none';
            }
        }
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
    },

    initTiltEffect() {
        // Implement ultra-gentle micro tilt action on mouse move
        const cards = document.querySelectorAll('.landing-banner-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const xc = rect.width / 2;
                const yc = rect.height / 2;

                const angleX = (yc - y) / 25; // Gentler limit
                const angleY = (x - xc) / 25;

                card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateY(-5px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
            });
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    BannerEngine.init();

    // Handle dynamic resize/orientation switches
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            BannerEngine.init();
        }, 250);
    });
});
