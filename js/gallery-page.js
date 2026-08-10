import { publicSupabase } from "./supabase-client.js";

/**
 * Professional Gallery Page Logic - Supabase Only Version
 */
const GalleryPage = {
    grid: null,
    filterContainer: null,
    loader: null,
    lightbox: null,
    items: [],
    categories: [],
    currentFilter: 'all',
    searchQuery: '',
    page: 0,
    perPage: 12,
    hasMore: true,
    loading: false,

    async init() {
        try {
            this.grid = document.getElementById('main-gallery-grid');
            this.filterContainer = document.getElementById('gallery-categories');
            this.loader = document.getElementById('gallery-loader');

            if (!this.grid) return;

            await this.loadCategories();
            await this.loadItems();
            this.initLightbox();
            this.initScroll();
            this.initSearch();
        } catch (err) {
            console.error('Gallery initialization failed:', err);
            this.showError('بروز خطا در راه‌اندازی گالری');
        }
    },

    async loadCategories() {
        try {
            const { data, error } = await publicSupabase
                .from('gallery_categories')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            if (error) throw error;
            this.categories = data || [];
            this.renderCategories();
        } catch (err) {
            console.error('Error loading categories:', err);
        }
    },

    renderCategories() {
        if (!this.filterContainer) return;

        const html = `
            <button class="filter-btn ${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all">همه موارد</button>
            ${this.categories.map(cat => `
                <button class="filter-btn ${this.currentFilter === cat.id ? 'active' : ''}" data-filter="${cat.id}">
                    ${cat.name}
                </button>
            `).join('')}
        `;
        this.filterContainer.innerHTML = html;

        this.filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleFilter(btn.dataset.filter));
        });
    },

    async handleFilter(catId) {
        if (this.currentFilter === catId) return;

        this.currentFilter = catId;
        this.resetPagination();
        this.renderCategories();
        await this.loadItems();
    },

    initSearch() {
        const searchInput = document.getElementById('gallery-search-input');
        if (!searchInput) return;

        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                this.searchQuery = e.target.value.trim();
                this.resetPagination();
                await this.loadItems();
            }, 500);
        });
    },

    resetPagination() {
        this.page = 0;
        this.items = [];
        this.hasMore = true;
        this.grid.innerHTML = '';
    },

    async loadItems() {
        if (this.loading || !this.hasMore) return;

        this.loading = true;
        if (this.loader) this.loader.style.display = 'block';

        try {
            if (publicSupabase.isMock) {
                this.renderMockState();
                this.hasMore = false;
                return;
            }

            let query = publicSupabase
                .from('gallery')
                .select('*, gallery_categories(name)')
                .eq('status', 'published')
                .order('created_at', { ascending: false })
                .range(this.page * this.perPage, (this.page + 1) * this.perPage - 1);

            if (this.currentFilter !== 'all') {
                query = query.eq('category_id', this.currentFilter);
            }

            if (this.searchQuery) {
                query = query.or(`title.ilike.%${this.searchQuery}%,description.ilike.%${this.searchQuery}%`);
            }

            const { data, error } = await query;

            if (error) throw error;

            if (!data || data.length === 0) {
                if (this.page === 0) this.renderEmptyState();
                this.hasMore = false;
                return;
            }

            if (data.length < this.perPage) {
                this.hasMore = false;
            }

            this.items = [...this.items, ...data];
            this.renderItems(data);
            this.page++;

            this.updateSchema();

        } catch (err) {
            console.error('Error loading gallery items:', err);
            if (this.page === 0) this.showError('خطا در دریافت اطلاعات. لطفا دوباره تلاش کنید.');
        } finally {
            this.loading = false;
            if (this.loader) this.loader.style.display = 'none';
        }
    },

    renderItems(newItems) {
        const html = newItems.map((item, idx) => {
            const globalIndex = this.items.length - newItems.length + idx;
            return `
                <article class="gallery-card" data-index="${globalIndex}" style="cursor: pointer;">
                    <div class="gallery-img-wrapper">
                        <img src="${item.thumbnail_url || item.image_url}" alt="${item.alt_text || item.title || 'Dell Cake'}" loading="lazy" onerror="this.src='images/logo/sweet-.png'">
                        ${item.watermark_enabled ? '<div class="wm-indicator"><i class="fas fa-copyright"></i></div>' : ''}
                    </div>
                    <div class="card-content">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                            <span class="card-category" style="margin-bottom: 0;">${item.gallery_categories?.name || 'سایر'}</span>
                            ${item.code ? `<span class="card-code" style="font-size: 0.8rem; color: #8c7b75; font-weight: 700; font-family: 'Vazirmatn', sans-serif;">کد: ${item.code}</span>` : ''}
                        </div>
                        <h3 class="card-title">${item.title || 'محصول دل‌کیک'}</h3>
                        <p class="card-desc">${item.description || ''}</p>
                    </div>
                </article>
            `;
        }).join('');

        if (this.page === 0) {
            this.grid.innerHTML = html;
        } else {
            this.grid.insertAdjacentHTML('beforeend', html);
        }

        // Add event listeners to the cards
        this.grid.querySelectorAll('.gallery-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const idx = parseInt(card.dataset.index, 10);
                this.openLightbox(idx);
            });
        });
    },

    renderEmptyState() {
        this.grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-images"></i>
                <p>هنوز نمونه کاری در این دسته ثبت نشده است.</p>
            </div>
        `;
    },

    renderMockState() {
        this.grid.innerHTML = `
            <div class="empty-state mock-state">
                <i class="fas fa-plug-circle-exclamation"></i>
                <p>اتصال به پایگاه داده برقرار نیست.</p>
                <span>لطفا تنظیمات Supabase را در فایل <code>js/supabase-config.js</code> وارد کنید.</span>
            </div>
        `;
    },

    showError(message) {
        if (!this.grid) return;
        this.grid.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
                <button onclick="location.reload()" class="retry-btn">تلاش مجدد</button>
            </div>
        `;
    },

    initLightbox() {
        // Create custom Lightbox elements in DOM if not present
        if (!document.getElementById('dc-lightbox')) {
            const lightboxHTML = `
                <div id="dc-lightbox" class="dc-lightbox-overlay" role="dialog" aria-modal="true">
                    <button class="dc-lightbox-close" aria-label="بستن">&times;</button>
                    <button class="dc-lightbox-nav dc-lightbox-prev" aria-label="قبلی"><i class="fas fa-chevron-right"></i></button>
                    <button class="dc-lightbox-nav dc-lightbox-next" aria-label="بعدی"><i class="fas fa-chevron-left"></i></button>
                    <div class="dc-lightbox-container" tabindex="0">
                        <div class="dc-lightbox-img-wrapper">
                            <img class="dc-lightbox-img" src="" alt="">
                        </div>
                        <div class="dc-lightbox-caption">
                            <h4 class="dc-lightbox-title"></h4>
                            <p class="dc-lightbox-desc"></p>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', lightboxHTML);
        }

        const overlay = document.getElementById('dc-lightbox');
        const closeBtn = overlay.querySelector('.dc-lightbox-close');
        const prevBtn = overlay.querySelector('.dc-lightbox-prev');
        const nextBtn = overlay.querySelector('.dc-lightbox-next');
        const container = overlay.querySelector('.dc-lightbox-container');

        // Close on overlay / background click (but not content click)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeLightbox();
            }
        });

        // Close button click
        closeBtn.addEventListener('click', () => this.closeLightbox());

        // Nav click
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.navigateLightbox(-1);
        });
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.navigateLightbox(1);
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (!overlay.classList.contains('active')) return;
            if (e.key === 'Escape') {
                this.closeLightbox();
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                this.navigateLightbox(-1);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                this.navigateLightbox(1);
            }
        });

        // Swipe support for mobile
        let touchStartX = 0;
        let touchEndX = 0;

        container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        }, { passive: true });
    },

    openLightbox(index) {
        if (index < 0 || index >= this.items.length) return;
        this.currentLightboxIndex = index;

        const item = this.items[index];
        const overlay = document.getElementById('dc-lightbox');
        const img = overlay.querySelector('.dc-lightbox-img');
        const title = overlay.querySelector('.dc-lightbox-title');
        const desc = overlay.querySelector('.dc-lightbox-desc');
        const container = overlay.querySelector('.dc-lightbox-container');

        // Fade effect transition
        img.style.opacity = '0';
        img.style.transform = 'scale(0.95)';

        img.src = item.image_url;
        img.alt = item.alt_text || item.title || 'Dell Cake';
        title.textContent = item.title
            ? (item.code ? `${item.title} (کد: ${item.code})` : item.title)
            : (item.code ? `محصول دل‌کیک (کد: ${item.code})` : 'محصول دل‌کیک');
        desc.textContent = item.description || '';

        img.onload = () => {
            img.style.opacity = '1';
            img.style.transform = 'scale(1)';
        };

        overlay.classList.add('active');
        document.body.classList.add('dc-lightbox-locked');
        container.focus();
    },

    closeLightbox() {
        const overlay = document.getElementById('dc-lightbox');
        if (overlay) {
            overlay.classList.remove('active');
        }
        document.body.classList.remove('dc-lightbox-locked');
    },

    navigateLightbox(direction) {
        if (typeof this.currentLightboxIndex === 'undefined') return;
        let newIndex = this.currentLightboxIndex + direction;

        // Infinite loop
        if (newIndex < 0) {
            newIndex = this.items.length - 1;
        } else if (newIndex >= this.items.length) {
            newIndex = 0;
        }

        this.openLightbox(newIndex);
    },

    handleSwipe(startX, endX) {
        const threshold = 50;
        if (startX - endX > threshold) {
            // Swipe Left -> Next (since the screen is RTL, swipe left is actually Next)
            this.navigateLightbox(1);
        } else if (endX - startX > threshold) {
            // Swipe Right -> Prev
            this.navigateLightbox(-1);
        }
    },

    initScroll() {
        window.addEventListener('scroll', () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
                this.loadItems();
            }
        });
    },

    updateSchema() {
        const scriptId = 'gallery-jsonld';
        let script = document.getElementById(scriptId);
        if (!script) {
            script = document.createElement('script');
            script.id = scriptId;
            script.type = 'application/ld+json';
            document.head.appendChild(script);
        }

        const schema = {
            "@context": "https://schema.org",
            "@type": "ImageGallery",
            "name": "گالری نمونه‌کارهای دل‌کیک",
            "description": "مجموعه‌ای از زیباترین و خوشمزه‌ترین کیک‌ها و شیرینی‌های خانگی دل‌کیک",
            "image": this.items.slice(0, 5).map(item => item.image_url),
            "author": {
                "@type": "Organization",
                "name": "دل‌کیک"
            }
        };

        script.text = JSON.stringify(schema);
    }
};

document.addEventListener('DOMContentLoaded', () => GalleryPage.init());
