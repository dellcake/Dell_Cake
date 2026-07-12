import { publicSupabase } from "./supabase-client.js";

async function applySiteSettings() {
    try {
        const { data, error } = await publicSupabase
            .from('site_settings')
            .select('value')
            .eq('key', 'site_config')
            .single();

        if (error) throw error;

        if (data && data.value) {
            const config = data.value;

            // 1. Branding
            if (config.logoUrl) {
                document.querySelectorAll('.site-logo-mini img, .menu-profile img, .dk-footer-logo').forEach(img => {
                    img.src = config.logoUrl;
                });
            }
            if (config.siteName) {
                document.querySelectorAll('.menu-profile h3, .footer-brand h3').forEach(el => {
                    el.innerText = config.siteName;
                });
                document.title = config.siteName;
            }

            // 2. Hero Section
            if (config.heroTitle) {
                const heroTitle = document.querySelector('.hero-title');
                if (heroTitle) heroTitle.innerText = config.heroTitle;
            }
            if (config.heroSlogan) {
                const heroSlogan = document.querySelector('.hero-slogan');
                if (heroSlogan) heroSlogan.innerText = config.heroSlogan;
            }
            if (config.heroDescription) {
                const heroDesc = document.querySelector('.hero-description');
                if (heroDesc) heroDesc.innerText = config.heroDescription;
            }

            // 3. Contact & Social
            if (config.phone) {
                document.querySelectorAll('a[href^="tel:"]').forEach(a => {
                    a.href = `tel:${config.phone}`;
                    if (a.innerText.includes('۰۹') || a.innerText.includes('09')) {
                        a.innerHTML = `<i class="fas fa-phone"></i> ${config.phone}`;
                    }
                });
            }
            if (config.instagram) {
                document.querySelectorAll('a[href*="instagram.com"]').forEach(a => {
                    a.href = `https://instagram.com/${config.instagram}`;
                });
            }
            if (config.telegram) {
                document.querySelectorAll('a[href*="t.me"]').forEach(a => {
                    a.href = `https://t.me/${config.telegram}`;
                });
            }
            if (config.bale) {
                document.querySelectorAll('a[href*="ble.ir"]').forEach(a => {
                    a.href = `https://ble.ir/${config.bale}`;
                });
            }

            // 4. SEO Meta Tags
            if (config.seoTitle) {
                document.title = config.seoTitle;
            }
            if (config.seoDescription) {
                let metaDesc = document.querySelector('meta[name="description"]');
                if (!metaDesc) {
                    metaDesc = document.createElement('meta');
                    metaDesc.name = 'description';
                    document.head.appendChild(metaDesc);
                }
                metaDesc.content = config.seoDescription;
            }
            if (config.seoKeywords) {
                let metaKeywords = document.querySelector('meta[name="keywords"]');
                if (!metaKeywords) {
                    metaKeywords = document.createElement('meta');
                    metaKeywords.name = 'keywords';
                    document.head.appendChild(metaKeywords);
                }
                metaKeywords.content = config.seoKeywords;
            }
        }
    } catch (error) {
        console.error("Error applying site settings:", error);
    }
}

async function loadDynamicGallery() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;

    try {
        const { data, error } = await publicSupabase
            .from('gallery')
            .select('url')
            .order('created_at', { ascending: false })
            .limit(16);

        if (error) throw error;

        if (data && data.length > 0) {
            galleryGrid.innerHTML = data.map(item => `
                <img src="${item.url}" alt="کیک دل کیک" loading="lazy">
            `).join('');
        }
    } catch (error) {
        console.error("Error loading gallery:", error);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    applySiteSettings();
    loadDynamicGallery();
});
