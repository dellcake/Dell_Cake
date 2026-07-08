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
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                const form = document.getElementById('settings-form');
                if (!form) return;

                // Fill form fields
                Object.keys(data.settings_json || {}).forEach(key => {
                    const input = form.querySelector(`[name="${key}"]`);
                    if (input) {
                        if (input.type === 'checkbox') input.checked = data.settings_json[key];
                        else input.value = data.settings_json[key];
                    }
                });

                // Update logo preview
                if (data.settings_json.logoUrl) {
                    const preview = document.getElementById('settings-logo-preview');
                    if (preview) preview.innerHTML = `<img src="${data.settings_json.logoUrl}" alt="Logo">`;
                }
            }
        } catch (err) {
            console.error('Error loading settings:', err);
        }
    },

    async save() {
        const form = document.getElementById('settings-form');
        if (!form) return;

        const formData = new FormData(form);
        const settings = {};
        formData.forEach((value, key) => {
            settings[key] = value;
        });

        try {
            // Check if settings record exists
            const { data: existing } = await supabase.from('site_settings').select('id').single();

            let error;
            if (existing) {
                const { error: err } = await supabase
                    .from('site_settings')
                    .update({ settings_json: settings, updated_at: new Date() })
                    .eq('id', existing.id);
                error = err;
            } else {
                const { error: err } = await supabase
                    .from('site_settings')
                    .insert([{ settings_json: settings }]);
                error = err;
            }

            if (error) throw error;
            alert('تنظیمات با موفقیت ذخیره شد.');
        } catch (err) {
            alert('خطا در ذخیره تنظیمات: ' + err.message);
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
