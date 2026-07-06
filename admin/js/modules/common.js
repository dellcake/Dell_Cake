import { supabase } from "../../../js/supabase-client.js";

/**
 * Common Helpers for dynamic modules
 */
export const BlogModule = {
    async load() {
        const { data } = await supabase.from('blog').select('*').order('created_at', { ascending: false });
        const tbody = document.getElementById('blog-tbody');
        if (tbody) tbody.innerHTML = (data || []).map(post => `
            <tr>
                <td><img src="${post.image_url || '../images/logo/sweet-.png'}" width="50"></td>
                <td>${post.title}</td>
                <td>${new Date(post.created_at).toLocaleDateString('fa-IR')}</td>
                <td><button class="btn-icon btn-delete" onclick="BlogModule.delete('${post.id}')"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `).join('');
    },
    async delete(id) {
        if (confirm('حذف شود؟')) {
            await supabase.from('blog').delete().eq('id', id);
            this.load();
        }
    }
};

export const MessagesModule = {
    async load() {
        const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
        const list = document.getElementById('messages-list');
        if (list) list.innerHTML = (data || []).map(msg => `
            <div class="message-card ${msg.status}">
                <h4>${msg.name} - ${msg.subject}</h4>
                <p>${msg.message}</p>
                <button class="btn-icon btn-delete" onclick="MessagesModule.delete('${msg.id}')"><i class="fa-solid fa-trash"></i></button>
            </div>
        `).join('');
    },
    async delete(id) {
        if (confirm('حذف شود؟')) {
            await supabase.from('contact_messages').delete().eq('id', id);
            this.load();
        }
    }
};

window.BlogModule = BlogModule;
window.MessagesModule = MessagesModule;
