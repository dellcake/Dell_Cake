import { supabase } from "./supabase-client.js";

/**
 * Home Gallery Logic
 */
export async function initHomeGallery() {
    const wrapper = document.getElementById('home-gallery-wrapper');
    if (!wrapper) return;

    try {
        // Fetch featured or latest gallery items
        const { data, error } = await supabase
            .from('gallery')
            .select('*')
            .eq('status', 'published')
            .order('is_featured', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        if (!data || data.length === 0) {
            wrapper.innerHTML = '<div class="swiper-slide">موردی برای نمایش یافت نشد</div>';
            return;
        }

        wrapper.innerHTML = data.map(item => `
            <div class="swiper-slide portfolio-slide">
                <div class="portfolio-item-inner">
                    <img data-src="${item.url}" class="swiper-lazy" alt="${item.alt_text || item.title || 'Dell Cake Portfolio'}">
                    <div class="swiper-lazy-preloader"></div>
                    <div class="portfolio-overlay">
                        <div class="portfolio-info">
                            <h4>${item.title || ''}</h4>
                            <span>${item.category || ''}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Initialize Swiper
        new Swiper('.portfolio-swiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },
            lazy: {
                loadPrevNext: true,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                640: { slidesPerView: 2 },
                992: { slidesPerView: 3 },
                1200: { slidesPerView: 4 }
            }
        });

    } catch (err) {
        console.error('Home Gallery Error:', err);
        wrapper.innerHTML = '<div class="swiper-slide">خطا در بارگذاری گالری</div>';
    }
}

// Call on DOMContentLoaded if index.html
if (document.querySelector('.portfolio-swiper')) {
    document.addEventListener('DOMContentLoaded', initHomeGallery);
}
