import { supabase } from "../../../js/supabase-client.js";

/**
 * Gallery Management Module - Supabase Version
 */
export const GalleryModule = {
    items: [],

    async load() {
        try {
            const { data, error } = await supabase
                .from('gallery')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            this.items = data || [];
            this.render();
        } catch (error) {
            console.error('Error fetching gallery:', error);
            this.render();
        }
    },

    render() {
        const grid = document.getElementById('gallery-grid');
        if (!grid) return;

        if (this.items.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-muted);">تصویری در گالری موجود نیست.</p>';
        } else {
            grid.innerHTML = this.items.map(item => `
                <div class="gallery-item-card">
                    <img src="${item.url}" alt="${item.title || 'تصویر گالری'}">
                    <div class="item-overlay">
                        <div class="item-info">
                            <h4>${item.title || 'بدون عنوان'}</h4>
                            <span>${this.translateCategory(item.category)}</span>
                        </div>
                        <div class="item-actions">
                            <button onclick="GalleryModule.delete('${item.id}')"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    },

    async add(event) {
        event.preventDefault();
        const form = event.target;
        const data = {
            url: form.imageUrl.value,
            category: form.category.value
        };

        try {
            const { error } = await supabase.from('gallery').insert([data]);
            if (error) throw error;

            form.reset();
            document.getElementById('add-gallery-modal').style.display = 'none';
            this.load();
        } catch (err) {
            alert('خطا در افزودن به گالری: ' + err.message);
        }
    },

    async delete(id) {
        if (!confirm('آیا از حذف این تصویر اطمینان دارید؟')) return;
        try {
            const { error } = await supabase.from('gallery').delete().eq('id', id);
            if (error) throw error;
            this.load();
        } catch (err) {
            alert('خطا در حذف: ' + err.message);
        }
    },

    translateCategory(cat) {
        const map = { 'cake': 'کیک', 'cupcake': 'کاپ کیک', 'dessert': 'دسر', 'pastry': 'شیرینی' };
        return map[cat] || cat;
    }
};

window.GalleryModule = GalleryModule;
window.addGalleryItem = (e) => GalleryModule.add(e);
window.openGalleryModal = () => document.getElementById('add-gallery-modal').style.display = 'flex';
window.closeGalleryModal = () => document.getElementById('add-gallery-modal').style.display = 'none';
