import { supabase } from "./supabase-client.js";

/**
 * Professional Gallery Page Logic
 */
const GalleryPage = {
    grid: null,
    filterContainer: null,
    loader: null,
    lightbox: null,
    items: [],
    categories: [],
    currentFilter: 'all',
    page: 0,
    perPage: 12,
    hasMore: true,
    loading: false,

    async init() {
        this.grid = document.getElementById('main-gallery-grid');
        this.filterContainer = document.getElementById('gallery-categories');
        this.loader = document.getElementById('gallery-loader');

        await this.loadCategories();
        await this.loadItems();
        this.initLightbox();
        this.initScroll();
    },

    async loadCategories() {
        try {
            const { data, error } = await supabase
                .from('gallery_categories')
                .select('*')
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
                <button class="filter-btn ${this.currentFilter === cat.slug ? 'active' : ''}" data-filter="${cat.slug}">
                    ${cat.name}
                </button>
            `).join('')}
        `;
        this.filterContainer.innerHTML = html;

        this.filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleFilter(btn.dataset.filter));
        });
    },

    async handleFilter(slug) {
        if (this.currentFilter === slug) return;

        this.currentFilter = slug;
        this.page = 0;
        this.items = [];
        this.hasMore = true;
        this.grid.innerHTML = '';

        this.renderCategories();
        await this.loadItems();
    },

    async loadItems() {
        if (this.loading || !this.hasMore) return;

        this.loading = true;
        this.loader.classList.remove('hidden');

        try {
            let query = supabase
                .from('gallery')
                .select('*')
                .eq('status', 'published')
                .order('created_at', { ascending: false })
                .range(this.page * this.perPage, (this.page + 1) * this.perPage - 1);

            if (this.currentFilter !== 'all') {
                // If using direct string categories for legacy or new category_id
                // Here we assume slug matches category name or handled via a join if we had category_id
                // For simplicity in this implementation, we use the 'category' field
                query = query.eq('category', this.currentFilter);
            }

            const { data, error } = await query;

            if (error) throw error;

            if (!data || data.length < this.perPage) {
                this.hasMore = false;
            }

            this.items = [...this.items, ...data];
            this.renderItems(data);
            this.page++;

            if (this.lightbox) this.lightbox.reload();
            this.updateSchema();

        } catch (err) {
            console.error('Error loading gallery items:', err);
        } finally {
            this.loading = false;
            this.loader.classList.add('hidden');
        }
    },

    renderItems(newItems) {
        if (this.page === 0 && (!newItems || newItems.length === 0)) {
            this.grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding:50px;">موردی برای نمایش یافت نشد.</p>';
            return;
        }

        const html = newItems.map(item => `
            <article class="gallery-card glightbox" data-glightbox="title: ${item.title || ''}; description: ${item.description || ''}" href="${item.url}">
                <div class="gallery-img-wrapper">
                    <img src="${item.thumbnail_url || item.url}" alt="${item.alt_text || item.title || 'Dell Cake'}" loading="lazy">
                </div>
                <div class="card-content">
                    <span class="card-category">${this.getCategoryName(item.category)}</span>
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

    getCategoryName(slug) {
        const cat = this.categories.find(c => c.slug === slug);
        return cat ? cat.name : slug;
    },

    initLightbox() {
        this.lightbox = GLightbox({
            selector: '.glightbox',
            touchNavigation: true,
            loop: true,
            autoplayVideos: true
        });
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
            "image": this.items.slice(0, 5).map(item => item.url),
            "author": {
                "@type": "Organization",
                "name": "دل‌کیک"
            }
        };

        script.text = JSON.stringify(schema);
    }
};

document.addEventListener('DOMContentLoaded', () => GalleryPage.init());
