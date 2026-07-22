import { supabase } from "../../../js/supabase-client.js";

/**
 * Settings Management Module
 */
export const SettingsModule = {
    async load() {
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .eq('key', 'global_settings')
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data && data.value) {
                const form = document.getElementById('settings-form');
                if (!form) return;

                const settings = data.value;

                // Fill form fields
                Object.keys(settings).forEach(key => {
                    const input = form.querySelector(`[name="${key}"]`);
                    if (input) {
                        if (input.type === 'checkbox') input.checked = settings[key];
                        else input.value = settings[key];
                    }
                });

                // Update logo preview
                if (settings.logoUrl) {
                    const preview = document.getElementById('settings-logo-preview');
                    if (preview) preview.innerHTML = `<img src="${settings.logoUrl}" alt="Logo">`;
                }
            }
        } catch (err) {
            console.error('Error loading settings:', err);
        }
    },

    async save() {
        const form = document.getElementById('settings-form');
        if (!form) return;

        const saveBtn = document.querySelector('button[onclick="saveSiteSettings()"]');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ذخیره...';
        }

        const formData = new FormData(form);
        const settings = {};
        formData.forEach((value, key) => {
            settings[key] = value;
        });

        try {
            const { error } = await supabase
                .from('site_settings')
                .upsert({
                    key: 'global_settings',
                    value: settings,
                    updated_at: new Date()
                });

            if (error) throw error;
            alert('تنظیمات با موفقیت ذخیره شد.');
        } catch (err) {
            console.error('Save settings error:', err);
            alert('خطا در ذخیره تنظیمات: ' + err.message);
        } finally {
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> ذخیره تغییرات';
            }
        }
    }
};

window.SettingsModule = SettingsModule;
window.saveSiteSettings = () => SettingsModule.save();
window.switchSettingsTab = (tab) => {
    document.querySelectorAll('.settings-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById(`tab-${tab}`).classList.add('active');
};
window.previewSiteLogo = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('settings-logo-preview').innerHTML = `<img src="${e.target.result}">`;
            // In a real app, you'd upload this to Supabase Storage first
            document.querySelector('input[name="logoUrl"]').value = e.target.result;
        };
        reader.readAsDataURL(file);
    }
};
