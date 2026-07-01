import { db } from "./firebase-db.js";
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

async function applySiteSettings() {
    try {
        const docRef = doc(db, "settings", "site");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

            // 1. Branding
            if (data.logoUrl) {
                document.querySelectorAll('.site-logo-mini img, .menu-profile img, .dk-footer-logo').forEach(img => {
                    img.src = data.logoUrl;
                });
            }
            if (data.siteName) {
                document.querySelectorAll('.menu-profile h3, .footer-brand h3').forEach(el => {
                    el.innerText = data.siteName;
                });
                document.title = data.siteName;
            }

            // 2. Hero Section
            if (data.heroTitle) {
                const heroTitle = document.querySelector('.hero-title');
                if (heroTitle) heroTitle.innerText = data.heroTitle;
            }
            if (data.heroSlogan) {
                const heroSlogan = document.querySelector('.hero-slogan');
                if (heroSlogan) heroSlogan.innerText = data.heroSlogan;
            }
            if (data.heroDescription) {
                const heroDesc = document.querySelector('.hero-description');
                if (heroDesc) heroDesc.innerText = data.heroDescription;
            }

            // 3. Contact & Social
            if (data.phone) {
                document.querySelectorAll('a[href^="tel:"]').forEach(a => {
                    a.href = `tel:${data.phone}`;
                    if (a.innerText.includes('۰۹') || a.innerText.includes('09')) {
                        a.innerHTML = `<i class="fas fa-phone"></i> ${data.phone}`;
                    }
                });
            }
            if (data.instagram) {
                document.querySelectorAll('a[href*="instagram.com"]').forEach(a => {
                    a.href = `https://instagram.com/${data.instagram}`;
                });
            }
            if (data.telegram) {
                document.querySelectorAll('a[href*="t.me"]').forEach(a => {
                    a.href = `https://t.me/${data.telegram}`;
                });
            }
            if (data.bale) {
                document.querySelectorAll('a[href*="ble.ir"]').forEach(a => {
                    a.href = `https://ble.ir/${data.bale}`;
                });
            }

            // 4. SEO Meta Tags
            if (data.seoTitle) {
                document.title = data.seoTitle;
            }
            if (data.seoDescription) {
                let metaDesc = document.querySelector('meta[name="description"]');
                if (!metaDesc) {
                    metaDesc = document.createElement('meta');
                    metaDesc.name = 'description';
                    document.head.appendChild(metaDesc);
                }
                metaDesc.content = data.seoDescription;
            }
            if (data.seoKeywords) {
                let metaKeywords = document.querySelector('meta[name="keywords"]');
                if (!metaKeywords) {
                    metaKeywords = document.createElement('meta');
                    metaKeywords.name = 'keywords';
                    document.head.appendChild(metaKeywords);
                }
                metaKeywords.content = data.seoKeywords;
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
        const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"), limit(16));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push(doc.data());
            });

            galleryGrid.innerHTML = items.map(item => `
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
