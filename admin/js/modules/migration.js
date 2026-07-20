import { supabase } from "../../../js/supabase-client.js";

/**
 * Migration Utility - Professional Image Importer
 * Scans local images and uploads them to Supabase Storage + Database
 */
export const MigrationModule = {
    localImages: [
        'cake1.jpg', 'cake2.jpg', 'cake3.jpg', 'cake4.jpg', 'cake5.jpg',
        'cake6.jpg', 'cake7.jpg', 'cake8.jpg', 'cake9.jpg', 'cake10.jpg',
        'cake11.jpg', 'cake12.jpg', 'cake13.jpg', 'cake14.jpg', 'cake15.jpg', 'cake16.jpg'
    ],

    async startMigration() {
        if (!confirm('آیا مایل به شروع فرآیند انتقال تصاویر محلی به سرور سوپابیس هستید؟')) return;

        const progressEl = document.getElementById('migration-progress');
        const logEl = document.getElementById('migration-log');
        if (progressEl) progressEl.style.display = 'block';

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < this.localImages.length; i++) {
            const imgName = this.localImages[i];
            const localPath = `../images/gallery/${imgName}`;

            try {
                this.log(`در حال انتقال: ${imgName}...`, logEl);

                // 1. Fetch local image as blob
                const response = await fetch(localPath);
                if (!response.ok) throw new Error('فایل یافت نشد');
                const blob = await response.blob();

                // 2. Upload to Supabase Storage
                const fileName = `migration_${Date.now()}_${imgName.replace(/\.[^/.]+$/, "")}.webp`;
                const { error: uploadError } = await supabase.storage
                    .from('gallery')
                    .upload(`full/${fileName}`, blob);

                if (uploadError) throw uploadError;

                const publicUrl = supabase.storage.from('gallery').getPublicUrl(`full/${fileName}`).data.publicUrl;

                // 3. Save to Database
                const { error: dbError } = await supabase.from('gallery').insert([{
                    title: `تصویر منتقل شده ${i + 1}`,
                    image_url: publicUrl,
                    thumbnail_url: publicUrl, // Using same for migration
                    status: 'published',
                    alt_text: 'Dell Cake Gallery'
                }]);

                if (dbError) throw dbError;

                successCount++;
                this.log(`✅ موفق: ${imgName} منتقل شد.`, logEl);
            } catch (err) {
                console.error(`Migration failed for ${imgName}:`, err);
                failCount++;
                this.log(`❌ خطا برای ${imgName}: ${err.message}`, logEl);
            }

            if (progressEl) {
                const percent = Math.round(((i + 1) / this.localImages.length) * 100);
                progressEl.querySelector('.progress-bar-fill').style.width = `${percent}%`;
            }
        }

        this.log(`--- پایان عملیات ---`, logEl);
        this.log(`موفق: ${successCount} | خطا: ${failCount}`, logEl);
        alert(`انتقال به پایان رسید.\nموفق: ${successCount}\nخطا: ${failCount}`);
    },

    log(msg, el) {
        if (!el) return;
        const div = document.createElement('div');
        div.innerText = msg;
        el.appendChild(div);
        el.scrollTop = el.scrollHeight;
    }
};

window.MigrationModule = MigrationModule;
