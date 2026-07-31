import { publicSupabase } from './supabase-client.js';

/**
 * Premium Academy Page Logic - Dynamic Supabase Version
 */
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
            const { data: cats, error: catErr } = await publicSupabase
                .from('course_categories')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            if (catErr) throw catErr;
            this.categories = cats || [];

            // Load Courses
            const { data: courses, error: courseErr } = await publicSupabase
                .from('courses')
                .select('*')
                .eq('status', 'published')
                .order('display_order', { ascending: true });

            if (courseErr) throw courseErr;
            this.courses = courses || [];
        } catch (error) {
            console.error('Error loading academy data:', error);
            // Dynamic fallback if Supabase client is in mock mode
            this.courses = [];
            this.categories = [];
        }
    },

    setupEventListeners() {
        // Live Search with Input Event
        const searchInput = document.getElementById('academy-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value.toLowerCase().trim();
                this.render();
            });
        }

        // Category Filter Select
        const catFilter = document.getElementById('filter-category');
        if (catFilter) {
            catFilter.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.updatePillActiveState(e.target.value);
                this.render();
            });
        }

        // Level Filter Select
        const levelFilter = document.getElementById('filter-level');
        if (levelFilter) {
            levelFilter.addEventListener('change', (e) => {
                this.filters.level = e.target.value;
                this.render();
            });
        }

        // Price Filter Select
        const priceFilter = document.getElementById('filter-price');
        if (priceFilter) {
            priceFilter.addEventListener('change', (e) => {
                this.filters.maxPrice = e.target.value;
                this.render();
            });
        }

        // Sort Select
        const sortSelect = document.getElementById('academy-sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sort = e.target.value;
                this.render();
            });
        }
    },

    updatePillActiveState(categoryValue) {
        const pills = document.querySelectorAll('.cat-pill');
        pills.forEach(pill => {
            if (pill.dataset.cat === categoryValue) {
                pill.classList.add('active');
            } else {
                pill.classList.remove('active');
            }
        });
    },

    render() {
        this.renderCategories();
        this.renderCourses();
    },

    renderCategories() {
        const catContainer = document.getElementById('category-pills');
        const catSelect = document.getElementById('filter-category');
        if (!catContainer) return;

        // Render dynamic category pills
        catContainer.innerHTML = `
            <button class="cat-pill ${this.filters.category === 'all' ? 'active' : ''}" data-cat="all">همه</button>
            ${this.categories.map(c => `
                <button class="cat-pill ${this.filters.category === c.slug ? 'active' : ''}" data-cat="${c.slug}">${c.name}</button>
            `).join('')}
        `;

        // Add pill click events
        catContainer.querySelectorAll('.cat-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                const catVal = btn.dataset.cat;
                this.filters.category = catVal;
                if (catSelect) catSelect.value = catVal;
                this.updatePillActiveState(catVal);
                this.render();
            });
        });

        // Update select options
        if (catSelect) {
            // Keep the default first option, and add categories dynamically
            catSelect.innerHTML = '<option value="all">همه دسته‌ها</option>' +
                this.categories.map(c => `<option value="${c.slug}">${c.name}</option>`).join('');
            catSelect.value = this.filters.category;
        }
    },

    renderCourses() {
        const grid = document.getElementById('courses-grid');
        const resultsCountEl = document.getElementById('results-count');
        if (!grid) return;

        let filtered = this.courses.filter(c => {
            const matchesSearch = !this.filters.search ||
                                 c.title.toLowerCase().includes(this.filters.search) ||
                                 c.description?.toLowerCase().includes(this.filters.search) ||
                                 c.short_description?.toLowerCase().includes(this.filters.search);

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

        // Advanced Sorting Logic
        if (this.sort === 'newest') {
            filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (this.sort === 'price-asc') {
            filtered.sort((a, b) => (a.price - (a.discount || 0)) - (b.price - (b.discount || 0)));
        } else if (this.sort === 'price-desc') {
            filtered.sort((a, b) => (b.price - (b.discount || 0)) - (a.price - (a.discount || 0)));
        } else if (this.sort === 'best-selling') {
            // Priority is determined by lower display_order or higher sessions count as best seller fallback
            filtered.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        }

        // Update results counter
        if (resultsCountEl) {
            resultsCountEl.textContent = `${filtered.length.toLocaleString('fa-IR')} دوره`;
        }

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>دوره‌ای با این مشخصات یافت نشد :(</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map((course, idx) => this.createCourseCard(course, idx)).join('');
    },

    createCourseCard(course, index) {
        const finalPrice = course.price - (course.discount || 0);
        const hasDiscount = course.discount > 0;
        const discountPercent = hasDiscount ? Math.round((course.discount / course.price) * 100) : 0;

        // Calculate dynamic status badges
        let badgeHtml = '';
        if (finalPrice === 0) {
            badgeHtml = '<div class="custom-status-badge free">رایگان</div>';
        } else if (hasDiscount) {
            badgeHtml = `<div class="custom-status-badge discount">${discountPercent}% تخفیف</div>`;
        } else if (course.level === 'advanced') {
            badgeHtml = '<div class="custom-status-badge vip">ویژه</div>';
        } else if (course.display_order === 1 || index === 0) {
            badgeHtml = '<div class="custom-status-badge best-seller">پرفروش</div>';
        } else {
            badgeHtml = '<div class="custom-status-badge new">جدید</div>';
        }

        return `
            <div class="course-card-v2" style="animation-delay: ${index * 0.1}s">
                <div class="card-thumb">
                    <img src="${course.image_url || 'images/logo/sweet-.png'}" alt="${course.title}" loading="lazy" onerror="this.src='images/logo/sweet-.png'">
                    <div class="badge-container">
                        ${badgeHtml}
                    </div>
                    <div class="level-badge ${course.level}">
                        <i class="fas fa-layer-group"></i> ${this.translateLevel(course.level)}
                    </div>
                </div>
                <div class="card-body">
                    <div class="card-meta-top">
                        <span><i class="fas fa-folder"></i> ${this.translateCategory(course.category)}</span>
                        <span><i class="fas fa-play-circle"></i> ${course.sessions_count || 1} جلسه</span>
                    </div>
                    <h3 class="course-title">${course.title}</h3>
                    <p class="course-excerpt">${course.short_description || 'آموزش گام به گام و فوق تخصصی با پشتیبانی مادام‌العمر.'}</p>

                    <div class="teacher-info">
                        <img src="images/logo/sweet-.png" alt="Teacher" onerror="this.src='images/logo/sweet-.png'">
                        <span>مدرس: ${course.teacher_name || 'مدیر دل‌کیک'}</span>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="price-box">
                        ${hasDiscount ? `<span class="old-price">${course.price.toLocaleString('fa-IR')}</span>` : ''}
                        <span class="final-price">
                            ${finalPrice === 0 ? 'رایگان' : `${finalPrice.toLocaleString('fa-IR')} <span>تومان</span>`}
                        </span>
                    </div>
                    <a href="course-detail.html?slug=${course.slug}" class="view-btn">
                        مشاهده دوره <i class="fas fa-chevron-left" style="font-size: 0.75rem;"></i>
                    </a>
                </div>
            </div>
        `;
    },

    translateLevel(level) {
        const map = { beginner: 'مبتدی', intermediate: 'متوسط', advanced: 'پیشرفته' };
        return map[level] || 'متوسط';
    },

    translateCategory(slug) {
        const cat = this.categories.find(c => c.slug === slug);
        return cat ? cat.name : 'سایر';
    }
};

document.addEventListener('DOMContentLoaded', () => Academy.init());
