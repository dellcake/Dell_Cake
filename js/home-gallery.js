import { publicSupabase } from "./supabase-client.js";

/**
 * Home Gallery Logic - Supabase Dynamic Version
 * Fetches only Featured items from the database using publicSupabase
 */
export async function initHomeGallery() {
    const wrapper = document.getElementById('home-gallery-wrapper');
    if (!wrapper) return;

    try {
        if (publicSupabase.isMock) {
            wrapper.innerHTML = `
                <div class="swiper-slide portfolio-slide">
                    <div class="portfolio-card no-data mock-data">
                        <i class="fas fa-plug-circle-exclamation" style="font-size: 2rem; color: #f01873; margin-bottom: 10px;"></i>
                        <p style="color: #6b3d2a; font-size: 0.9rem; text-align:center; font-weight: 700;">اتصال پایگاه‌داده برقرار نیست</p>
                        <p style="color: #8c7b75; font-size: 0.8rem; text-align:center; margin-top: 5px;">لطفا تنظیمات Supabase را در <br><code>js/supabase-config.js</code> وارد کنید.</p>
                    </div>
                </div>
            `;
            return;
        }

        // Fetch only Featured & Published gallery items via public client
        const { data, error } = await publicSupabase
            .from('gallery')
            .select('*, gallery_categories(name)')
            .eq('status', 'published')
            .eq('is_featured', true)
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        if (!data || data.length === 0) {
            wrapper.innerHTML = `
                <div class="swiper-slide portfolio-slide">
                    <div class="portfolio-card no-data">
                        <img src="images/logo/sweet-.png" alt="دل‌کیک" style="opacity: 0.2; width: 80px; height: auto;">
                        <p style="margin-top: 15px; color: #6b3d2a; font-weight: bold; font-size: 0.9rem;">هنوز نمونه‌کار ویژه‌ای ثبت نشده است</p>
                    </div>
                </div>
            `;
            return;
        }

        wrapper.innerHTML = data.map(item => `
            <div class="swiper-slide portfolio-slide">
                <div class="portfolio-card">
                    <div class="portfolio-img-wrapper">
                        <img src="${item.thumbnail_url || item.image_url}" loading="lazy" decoding="async" alt="${item.alt_text || item.title || 'Dell Cake Portfolio'}" onerror="this.src='images/logo/sweet-.png'">
                        <span class="portfolio-category-badge">${item.gallery_categories?.name || 'سایر'}</span>
                    </div>
                    <div class="portfolio-info-box">
                        <h4 class="portfolio-card-title">${item.title || ''}</h4>
                        <span class="portfolio-card-subtitle">نمونه‌کار گالری دل‌کیک</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Initialize Swiper
        if (typeof Swiper !== 'undefined') {
            new Swiper('.portfolio-swiper', {
                slidesPerView: 1,
                spaceBetween: 16,
                loop: data.length > 3,
                autoplay: {
                    delay: 4500,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                },
                pagination: {
                    el: '.portfolio-swiper-pagination',
                    clickable: true,
                },
                navigation: {
                    nextEl: '.portfolio-swiper-next',
                    prevEl: '.portfolio-swiper-prev',
                },
                keyboard: {
                    enabled: true,
                    onlyInViewport: true,
                },
                a11y: {
                    prevSlideMessage: 'نمونه‌کار قبلی',
                    nextSlideMessage: 'نمونه‌کار بعدی',
                },
                breakpoints: {
                    640: {
                        slidesPerView: 2,
                        spaceBetween: 24
                    },
                    1024: {
                        slidesPerView: 3,
                        spaceBetween: 30
                    }
                }
            });
        }

    } catch (err) {
        console.error('Home Gallery Error:', err);
        wrapper.innerHTML = `
            <div class="swiper-slide">
                <div class="portfolio-item-inner no-data error-data">
                    <p style="color: #6b3d2a;">خطا در بارگذاری گالری ویژه</p>
                    <button onclick="location.reload()" style="margin-top:10px; background:#e8789a; color:white; border:none; padding:5px 15px; border-radius:20px; font-size:0.8rem; cursor:pointer;">تلاش مجدد</button>
                </div>
            </div>
        `;
    }
}

if (document.querySelector('.portfolio-swiper')) {
    document.addEventListener('DOMContentLoaded', initHomeGallery);
}
