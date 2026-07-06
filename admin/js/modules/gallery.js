import { supabase } from "../../../js/supabase-client.js";

/**
 * Enhanced Gallery Management Module
 */
export const GalleryModule = {
    items: [],

    async load() {
        const { data, error } = await supabase
            .from('gallery')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching gallery:', error);
            return;
        }
        this.items = data;
        this.render();
    },

    render() {
        const grid = document.getElementById('gallery-grid');
        if (!grid) return;

        grid.innerHTML = this.items.map(item => `
            <div class="gallery-item">
                <span class="category-badge">${item.category}</span>
                <img src="${item.url}">
                <div class="gallery-item-info">
                    <h4>${item.description || 'بدون توضیحات'}</h4>
                </div>
                <div class="gallery-item-overlay">
                    <button class="btn-icon btn-delete" onclick="GalleryModule.delete('${item.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    async upload(event) {
        // Implementation for upload with description, category, and tags
        alert('بخش آپلود پیشرفته آماده اتصال به Storage است.');
    },

    async delete(id) {
        if (!confirm('آیا از حذف این تصویر اطمینان دارید؟')) return;
        await supabase.from('gallery').delete().eq('id', id);
        this.load();
    }
};

window.GalleryModule = GalleryModule;
