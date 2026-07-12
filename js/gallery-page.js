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
                .order('display_order', { ascending: true })
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

            if (this.lightbox) this.lightbox.reload();
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
        const html = newItems.map(item => `
            <article class="gallery-card glightbox" data-glightbox="title: ${item.title || ''}; description: ${item.description || ''}" href="${item.image_url}">
                <div class="gallery-img-wrapper">
                    <img src="${item.thumbnail_url || item.image_url}" alt="${item.alt_text || item.title || 'Dell Cake'}" loading="lazy" onerror="this.src='images/logo/sweet-.png'">
                    ${item.watermark_enabled ? '<div class="wm-indicator"><i class="fas fa-copyright"></i></div>' : ''}
                </div>
                <div class="card-content">
                    <span class="card-category">${item.gallery_categories?.name || 'سایر'}</span>
                    <h3 class="card-title">${item.title || 'محصول دل‌کیک'}</h3>
                    <p class="card-desc">${item.description || ''}</p>
                </div>
            </article>
        `).join('');

        if (this.page === 0) {
            this.grid.innerHTML = html;
        } else {
            this.grid.insertAdjacentHTML('beforeend', html);
        }
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
        if (typeof GLightbox !== 'undefined') {
            this.lightbox = GLightbox({
                selector: '.glightbox',
                touchNavigation: true,
                loop: true,
                autoplayVideos: true
            });
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
