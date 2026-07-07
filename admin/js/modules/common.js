import { supabase } from "../../../js/supabase-client.js";

/**
 * Common Helpers for dynamic modules - Supabase Version
 */
export const BlogModule = {
    async load() {
        try {
            const { data, error } = await supabase
                .from('blog')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const tbody = document.getElementById('blog-tbody');
            if (tbody) tbody.innerHTML = (data || []).map(post => `
                <tr>
                    <td><img src="${post.image_url || '../images/logo/sweet-.png'}" width="50"></td>
                    <td>${post.title}</td>
                    <td>${post.created_at ? new Date(post.created_at).toLocaleDateString('fa-IR') : 'نامشخص'}</td>
                    <td><button class="btn-icon btn-delete" onclick="BlogModule.delete('${post.id}')"><i class="fa-solid fa-trash"></i></button></td>
                </tr>
            `).join('');
        } catch (err) {
            console.error('Error loading blog:', err);
        }
    },
    async delete(id) {
        if (confirm('حذف شود؟')) {
            try {
                const { error } = await supabase.from('blog').delete().eq('id', id);
                if (error) throw error;
                this.load();
            } catch (err) {
                alert('خطا در حذف: ' + err.message);
            }
        }
    }
};

export const MessagesModule = {
    async load() {
        try {
            const { data, error } = await supabase
                .from('contact_messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const list = document.getElementById('messages-list');
            if (list) list.innerHTML = (data || []).map(msg => `
                <div class="message-card ${msg.status || ''}">
                    <h4>${msg.name} - ${msg.subject || 'بدون موضوع'}</h4>
                    <p>${msg.message}</p>
                    <button class="btn-icon btn-delete" onclick="MessagesModule.delete('${msg.id}')"><i class="fa-solid fa-trash"></i></button>
                </div>
            `).join('');
        } catch (err) {
            console.error('Error loading messages:', err);
        }
    },
    async delete(id) {
        if (confirm('حذف شود؟')) {
            try {
                const { error } = await supabase.from('contact_messages').delete().eq('id', id);
                if (error) throw error;
                this.load();
            } catch (err) {
                alert('خطا در حذف: ' + err.message);
            }
        }
    }
};

window.BlogModule = BlogModule;
window.MessagesModule = MessagesModule;
