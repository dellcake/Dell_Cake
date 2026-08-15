import { publicSupabase } from "./supabase-client.js";

/**
 * Professional Multi-Image Gallery Page Logic - Supabase Dynamic Version
 */
const GalleryPage = {
    grid: null,
    filterContainer: null,
    loader: null,
    items: [],
    categories: [],
    currentFilter: 'all',
    searchQuery: '',
    page: 0,
    perPage: 12,
    hasMore: true,
    loading: false,

    // Lightbox State
    currentProductIndex: 0,
    currentSubImageIndex: 0,

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
                .select('*, gallery_categories(name), gallery_images(*)')
                .eq('status', 'published')
                .order('created_at', { ascending: false })
                .range(this.page * this.perPage, (this.page + 1) * this.perPage - 1);

            if (this.currentFilter !== 'all') {
                query = query.eq('category_id', this.currentFilter);
            }

            if (this.searchQuery) {
                const queryStr = this.searchQuery.trim();
                if (/^\d+$/.test(queryStr)) {
                    query = query.or(`code.eq.${queryStr},title.ilike.%${queryStr}%,description.ilike.%${queryStr}%`);
                } else {
                    query = query.or(`title.ilike.%${queryStr}%,description.ilike.%${queryStr}%`);
                }
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
            const galleryImages = item.gallery_images || [];
            const totalImages = galleryImages.length > 0 ? galleryImages.length : (item.image_url ? 1 : 0);

            return `
                <article class="gallery-card" data-index="${globalIndex}" style="cursor: pointer;">
                    <div class="gallery-img-wrapper">
                        <img src="${item.thumbnail_url || item.image_url}" alt="${item.alt_text || item.title || 'Dell Cake'}" loading="lazy" onerror="this.src='images/logo/sweet-.png'">
                        ${totalImages > 1 ? `
                            <span style="position: absolute; bottom: 10px; right: 10px; background: rgba(107, 61, 42, 0.85); color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; backdrop-filter: blur(4px); z-index: 2;">
                                <i class="fas fa-camera"></i> ${totalImages} تصویر
                            </span>
                        ` : ''}
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
            card.addEventListener('click', () => {
                const idx = parseInt(card.dataset.index, 10);
                this.openLightbox(idx, 0);
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
        if (!document.getElementById('dc-lightbox')) {
            const lightboxHTML = `
                <div id="dc-lightbox" class="dc-lightbox-overlay" role="dialog" aria-modal="true">
                    <button class="dc-lightbox-close" aria-label="بستن">&times;</button>
                    <button class="dc-lightbox-nav dc-lightbox-prev" aria-label="قبلی"><i class="fas fa-chevron-right"></i></button>
                    <button class="dc-lightbox-nav dc-lightbox-next" aria-label="بعدی"><i class="fas fa-chevron-left"></i></button>
                    <div class="dc-lightbox-container" tabindex="0">
                        <div class="dc-lightbox-img-wrapper">
                            <img class="dc-lightbox-img" src="" alt="">
                            <div class="dc-lightbox-counter" id="dc-lightbox-counter" style="position: absolute; bottom: 12px; left: 12px; background: rgba(107, 61, 42, 0.85); color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; backdrop-filter: blur(4px);"></div>
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

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeLightbox();
            }
        });

        closeBtn.addEventListener('click', () => this.closeLightbox());

        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.navigateLightbox(-1);
        });
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.navigateLightbox(1);
        });

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

    getProductImages(productItem) {
        if (productItem.gallery_images && productItem.gallery_images.length > 0) {
            return productItem.gallery_images;
        }
        if (productItem.image_url) {
            return [{ image_url: productItem.image_url, thumbnail_url: productItem.thumbnail_url }];
        }
        return [];
    },

    openLightbox(productIdx, subImageIdx = 0) {
        if (productIdx < 0 || productIdx >= this.items.length) return;

        this.currentProductIndex = productIdx;
        this.currentSubImageIndex = subImageIdx;

        const product = this.items[productIdx];
        const images = this.getProductImages(product);

        if (images.length === 0) return;

        // Clamp subImageIdx
        if (this.currentSubImageIndex < 0) this.currentSubImageIndex = 0;
        if (this.currentSubImageIndex >= images.length) this.currentSubImageIndex = images.length - 1;

        const currentImage = images[this.currentSubImageIndex];

        const overlay = document.getElementById('dc-lightbox');
        const img = overlay.querySelector('.dc-lightbox-img');
        const title = overlay.querySelector('.dc-lightbox-title');
        const desc = overlay.querySelector('.dc-lightbox-desc');
        const counter = overlay.querySelector('#dc-lightbox-counter');
        const container = overlay.querySelector('.dc-lightbox-container');

        img.style.opacity = '0';
        img.style.transform = 'scale(0.95)';

        img.src = currentImage.image_url;
        img.alt = product.alt_text || product.title || 'Dell Cake';

        title.textContent = product.title
            ? (product.code ? `${product.title} (کد: ${product.code})` : product.title)
            : (product.code ? `محصول دل‌کیک (کد: ${product.code})` : 'محصول دل‌کیک');

        desc.textContent = product.description || '';

        if (counter) {
            if (images.length > 1) {
                counter.style.display = 'block';
                counter.innerText = `${this.currentSubImageIndex + 1} از ${images.length}`;
            } else {
                counter.style.display = 'none';
            }
        }

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
        if (typeof this.currentProductIndex === 'undefined') return;

        const product = this.items[this.currentProductIndex];
        const images = this.getProductImages(product);

        let newSubIdx = this.currentSubImageIndex + direction;

        if (newSubIdx >= 0 && newSubIdx < images.length) {
            // Stay within current product images
            this.openLightbox(this.currentProductIndex, newSubIdx);
        } else {
            // Move to next or previous product item
            let newProdIdx = this.currentProductIndex + direction;
            if (newProdIdx < 0) {
                newProdIdx = this.items.length - 1;
            } else if (newProdIdx >= this.items.length) {
                newProdIdx = 0;
            }

            const nextProduct = this.items[newProdIdx];
            const nextImages = this.getProductImages(nextProduct);
            const startSubIdx = direction > 0 ? 0 : nextImages.length - 1;

            this.openLightbox(newProdIdx, startSubIdx);
        }
    },

    handleSwipe(startX, endX) {
        const threshold = 50;
        if (startX - endX > threshold) {
            // Swipe Left -> Next
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
