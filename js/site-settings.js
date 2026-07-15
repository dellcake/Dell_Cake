import { publicSupabase } from "./supabase-client.js";

/**
 * Site Settings Logic - Applies branding and configuration from Supabase
 */
async function applySiteSettings() {
    try {
        const { data, error } = await publicSupabase
            .from('site_settings')
            .select('value')
            .eq('key', 'global_settings')
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data && data.value) {
            const config = data.value;

            // 1. Branding (Logo and Site Name)
            if (config.logoUrl) {
                document.querySelectorAll('.site-logo-mini img, .menu-profile img, .dk-footer-logo, .dk-footer-logo img').forEach(img => {
                    // Handle both direct img tags and containers
                    if (img.tagName === 'IMG') {
                        img.src = config.logoUrl;
                    } else {
                        const childImg = img.querySelector('img');
                        if (childImg) childImg.src = config.logoUrl;
                    }
                });
            }
            if (config.siteName) {
                document.querySelectorAll('.menu-profile h3, .footer-brand h3, .footer-brand h2').forEach(el => {
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

            // 3. Contact & Social Media
            if (config.phone) {
                document.querySelectorAll('a[href^="tel:"]').forEach(a => {
                    a.href = `tel:${config.phone}`;
                    // Update text if it's a phone number display
                    if (a.innerText.trim().match(/^[0-9+۰-۹\s-]+$/) || a.querySelector('.fa-phone')) {
                        const icon = a.querySelector('i') ? a.querySelector('i').outerHTML : '<i class="fas fa-phone"></i>';
                        a.innerHTML = `${icon} ${config.phone}`;
                    }
                });
            }

            // Social links helper
            const updateSocialLink = (selector, handle, baseUrl) => {
                if (!handle) return;
                const cleanHandle = handle.replace('@', '').replace(baseUrl, '').split('/').pop();
                document.querySelectorAll(selector).forEach(a => {
                    a.href = `${baseUrl}${cleanHandle}`;
                });
            };

            updateSocialLink('a[href*="instagram.com"]', config.instagram, 'https://instagram.com/');
            updateSocialLink('a[href*="t.me"]', config.telegram, 'https://t.me/');
            updateSocialLink('a[href*="ble.ir"]', config.bale, 'https://ble.ir/');

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

// Initialize on load
document.addEventListener('DOMContentLoaded', applySiteSettings);
