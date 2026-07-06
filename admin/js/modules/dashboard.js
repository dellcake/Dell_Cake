import { supabase } from "../../../js/supabase-client.js";

export async function loadDashboardData() {
    try {
        const [
            { count: orderCount },
            { count: courseCount },
            { count: galleryCount }
        ] = await Promise.all([
            supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'new'),
            supabase.from('courses').select('*', { count: 'exact', head: true }),
            supabase.from('gallery').select('*', { count: 'exact', head: true })
        ]);

        document.getElementById('new-orders').innerText = (orderCount || 0).toLocaleString('fa-IR');
        document.getElementById('total-courses').innerText = (courseCount || 0).toLocaleString('fa-IR');
        document.getElementById('total-gallery').innerText = (galleryCount || 0).toLocaleString('fa-IR');

    } catch (error) {
        console.error("Dashboard error:", error);
    }
}
