/**
 * Dell Cake Toast Utility
 */
export const showToast = (message, title = 'دل‌کیک', duration = 5000) => {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'dc-toast';
    toast.innerHTML = `
        <div class="dc-toast-icon">
            <i class="fa-solid fa-cake-candles"></i>
        </div>
        <div class="dc-toast-content">
            <span class="dc-toast-title">${title}</span>
            <span class="dc-toast-msg">${message}</span>
        </div>
    `;

    container.appendChild(toast);

    // Auto close
    const closeToast = () => {
        toast.classList.add('hiding');
        setTimeout(() => {
            toast.remove();
            if (container.children.length === 0) {
                container.remove();
            }
        }, 500);
    };

    setTimeout(closeToast, duration);

    // Click to close
    toast.onclick = closeToast;
};

// Auto-trigger if URL has login=success
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('login') === 'success') {
        showToast(
            'به خانواده دل‌کیک خوش اومدی 💖 امیدواریم لحظه‌های شیرینی کنار ما داشته باشی.',
            '🎂'
        );
        // Clean URL
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
    }
});
