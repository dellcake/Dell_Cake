import { publicSupabase } from './supabase-client.js';

export const Academy = {
    courses: [],
    categories: [],
    filters: {
        category: 'all',
        level: 'all',
        maxPrice: 'all',
        search: ''
    },
    sort: 'newest',

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.render();
    },

    async loadData() {
        try {
            // Load Categories
            const { data: cats } = await publicSupabase
                .from('course_categories')
                .select('*')
                .eq('is_active', true)
                .order('display_order');

            this.categories = cats || [];

            // Load Courses
            const { data: courses } = await publicSupabase
                .from('courses')
                .select('*')
                .eq('status', 'published')
                .order('display_order');

            this.courses = courses || [];
        } catch (error) {
            console.error('Error loading academy data:', error);
        }
    },

    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('academy-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value.toLowerCase();
                this.render();
            });
        }

        // Category Filter
        const catFilter = document.getElementById('filter-category');
        if (catFilter) {
            catFilter.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.render();
            });
        }

        // Level Filter
        const levelFilter = document.getElementById('filter-level');
        if (levelFilter) {
            levelFilter.addEventListener('change', (e) => {
                this.filters.level = e.target.value;
                this.render();
            });
        }

        // Price Filter
        const priceFilter = document.getElementById('filter-price');
        if (priceFilter) {
            priceFilter.addEventListener('change', (e) => {
                this.filters.maxPrice = e.target.value;
                this.render();
            });
        }

        // Sort
        const sortSelect = document.getElementById('academy-sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sort = e.target.value;
                this.render();
            });
        }
    },

    render() {
        this.renderCategories();
        this.renderCourses();
    },

    renderCategories() {
        const catContainer = document.getElementById('category-pills');
        const catSelect = document.getElementById('filter-category');
        if (!catContainer) return;

        // Render pills for home/hero
        catContainer.innerHTML = `
            <button class="cat-pill ${this.filters.category === 'all' ? 'active' : ''}" data-cat="all">همه</button>
            ${this.categories.map(c => `
                <button class="cat-pill ${this.filters.category === c.slug ? 'active' : ''}" data-cat="${c.slug}">${c.name}</button>
            `).join('')}
        `;

        // Add pill click events
        catContainer.querySelectorAll('.cat-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                this.filters.category = btn.dataset.cat;
                if (catSelect) catSelect.value = btn.dataset.cat;
                this.render();
            });
        });

        // Update select options if empty
        if (catSelect && catSelect.options.length <= 1) {
            this.categories.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.slug;
                opt.textContent = c.name;
                catSelect.appendChild(opt);
            });
        }
    },

    renderCourses() {
        const grid = document.getElementById('courses-grid');
        if (!grid) return;

        let filtered = this.courses.filter(c => {
            const matchesSearch = c.title.toLowerCase().includes(this.filters.search) ||
                                 c.description?.toLowerCase().includes(this.filters.search);
            const matchesCat = this.filters.category === 'all' || c.category === this.filters.category;
            const matchesLevel = this.filters.level === 'all' || c.level === this.filters.level;

            let matchesPrice = true;
            const finalPrice = c.price - (c.discount || 0);
            if (this.filters.maxPrice !== 'all') {
                const max = parseInt(this.filters.maxPrice);
                matchesPrice = finalPrice <= max;
            }

            return matchesSearch && matchesCat && matchesLevel && matchesPrice;
        });

        // Sort
        if (this.sort === 'newest') filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        if (this.sort === 'price-asc') filtered.sort((a, b) => (a.price - a.discount) - (b.price - b.discount));
        if (this.sort === 'price-desc') filtered.sort((a, b) => (b.price - b.discount) - (a.price - a.discount));

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>دوره ای با این مشخصات یافت نشد :(</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map(course => this.createCourseCard(course)).join('');
    },

    createCourseCard(course) {
        const finalPrice = course.price - (course.discount || 0);
        const hasDiscount = course.discount > 0;
        const discountPercent = hasDiscount ? Math.round((course.discount / course.price) * 100) : 0;

        return `
            <div class="course-card-v2">
                <div class="card-thumb">
                    <img src="${course.image_url || 'images/academy/course-placeholder.jpg'}" alt="${course.title}" loading="lazy">
                    ${hasDiscount ? `<div class="discount-badge">${discountPercent}% تخفیف</div>` : ''}
                    <div class="level-badge ${course.level}">${this.translateLevel(course.level)}</div>
                </div>
                <div class="card-body">
                    <div class="card-meta-top">
                        <span class="cat-name"><i class="fas fa-folder"></i> ${this.translateCategory(course.category)}</span>
                        <span class="sessions"><i class="fas fa-play-circle"></i> ${course.sessions_count || 1} جلسه</span>
                    </div>
                    <h3 class="course-title">${course.title}</h3>
                    <p class="course-excerpt">${course.short_description || ''}</p>

                    <div class="teacher-info">
                        <img src="images/logo/sweet-.png" alt="Teacher">
                        <span>مدرس: ${course.teacher_name || 'مدیر دل‌کیک'}</span>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="price-box">
                        ${hasDiscount ? `<span class="old-price">${course.price.toLocaleString('fa-IR')}</span>` : ''}
                        <span class="final-price">${finalPrice.toLocaleString('fa-IR')} <span>تومان</span></span>
                    </div>
                    <a href="course-detail.html?slug=${course.slug}" class="view-btn">مشاهده دوره <i class="fas fa-chevron-left"></i></a>
                </div>
            </div>
        `;
    },

    translateLevel(level) {
        const map = { beginner: 'مبتدی', intermediate: 'متوسط', advanced: 'پیشرفته' };
        return map[level] || level;
    },

    translateCategory(slug) {
        const cat = this.categories.find(c => c.slug === slug);
        return cat ? cat.name : 'سایر';
    }
};

document.addEventListener('DOMContentLoaded', () => Academy.init());
