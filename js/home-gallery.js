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
            wrapper.innerHTML = `
                <div class="swiper-slide portfolio-slide">
                    <div class="portfolio-item-inner no-data">
                        <img src="images/logo/sweet-.png" alt="دل‌کیک" style="opacity: 0.2; width: 150px; height: auto;">
                        <p style="margin-top: 15px; color: #6b3d2a; font-weight: bold;">هنوز نمونه‌کاری ثبت نشده است</p>
                    </div>
                </div>
            `;
            return;
        }

        wrapper.innerHTML = data.map(item => `
            <div class="swiper-slide portfolio-slide">
                <div class="portfolio-item-inner">
                    <img src="${item.thumbnail_url || item.url}" loading="lazy" alt="${item.alt_text || item.title || 'Dell Cake Portfolio'}">
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
        if (typeof Swiper === 'undefined') {
            console.error('Swiper is not loaded');
            return;
        }

        new Swiper('.portfolio-swiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: data.length > 4,
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
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
