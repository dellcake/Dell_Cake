// Service Worker for Dell Cake Push Notifications
self.addEventListener('push', function(event) {
    let payload = {};
    try {
        payload = event.data ? event.data.json() : {};
    } catch (e) {
        payload = {
            title: "🍰 Dell Cake",
            body: event.data ? event.data.text() : "سفارش جدیدی در دل‌کیک ثبت شد!"
        };
    }

    const title = payload.title || "🍰 Dell Cake";
    const options = {
        body: payload.body || "یک سفارش جدید ثبت شده است. برای مشاهده جزئیات کلیک کنید.",
        icon: payload.icon || "/images/logo/sweet-.png",
        badge: payload.badge || "/images/logo/sweet-.png",
        dir: "rtl",
        vibrate: [200, 100, 200],
        data: {
            url: payload.url || "/admin/admin.html"
        }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const targetUrl = event.notification.data?.url || "/admin/admin.html";

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
            // Check if there is already a tab open with this URL
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes(targetUrl) && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, open a new window
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
