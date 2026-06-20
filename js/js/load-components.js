async function loadComponent(containerId, filePath) {

    const response = await fetch(filePath);

    if (!response.ok) {
        console.error(`خطا در بارگذاری ${filePath}`);
        return;
    }

    const html = await response.text();

    document.getElementById(containerId).innerHTML = html;
}
