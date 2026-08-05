document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-link');
    const contents = document.querySelectorAll('.tab-content');

    function activateTab(tabId) {
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));

        const targetTab = Array.from(tabs).find(t => t.dataset.tab === tabId);
        const targetContent = document.getElementById(tabId);

        if (targetTab && targetContent) {
            targetTab.classList.add('active');
            targetContent.classList.add('active');
        }
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            activateTab(target);
        });
    });

    // Parse URL query parameter tab
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');

    if (tabParam) {
        if (tabParam === 'cake') {
            activateTab('cakeTab');
        } else if (tabParam === 'sweets') {
            activateTab('cookiesTab');
        } else if (tabParam === 'dummy') {
            activateTab('dummyTab');
        }
    }
});
