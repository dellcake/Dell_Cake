async function loadComponent(containerId, filePath) {

    const response = await fetch(filePath);

    const html = await response.text();

    document.getElementById(containerId).innerHTML = html;

    document.dispatchEvent(
        new CustomEvent("componentsLoaded")
    );
}
