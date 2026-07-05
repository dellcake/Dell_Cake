async function loadComponent(containerId, filePath) {
    try {
        const response = await fetch(filePath);
        let html = await response.text();

        // Standardize base path for local development vs GitHub Pages
        const path = window.location.pathname;
        const parts = path.split('/');
        const repo = parts[1];
        let base = '';
        if (window.location.hostname.includes('github.io') && repo && !['admin', 'user', 'login', 'register'].includes(repo)) {
            base = '/' + repo;
        }

        // Adjust internal links in components (only if they aren't external or absolute)
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        doc.querySelectorAll('a, img').forEach(el => {
            const attr = el.tagName === 'A' ? 'href' : 'src';
            const val = el.getAttribute(attr);

            if (val && !val.startsWith('http') && !val.startsWith('#') && !val.startsWith('tel:') && !val.startsWith('mailto:')) {
                // Prepend base path if not already present
                if (base && !val.startsWith(base)) {
                    // Remove leading dot or slash
                    const cleanVal = val.replace(/^(\.|\/)+/, '');
                    el.setAttribute(attr, `${base}/${cleanVal}`);
                }
            }
        });

        document.getElementById(containerId).innerHTML = doc.body.innerHTML;

        document.dispatchEvent(
            new CustomEvent("componentsLoaded", { detail: { containerId } })
        );
    } catch (error) {
        console.error(`Error loading component ${filePath}:`, error);
    }
}
