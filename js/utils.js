/**
 * Shared Utilities for Dell Cake
 */

/**
 * Detects and returns the base path for the application.
 * Handles GitHub Pages subfolder deployment.
 * @returns {string} The base path (e.g., '/Dell-Cake' or '')
 */
export function getBasePath() {
    const path = window.location.pathname;
    const parts = path.split('/');
    const repo = parts[1];
    const isGitHubPages = window.location.hostname.includes('github.io');

    // Check if the first path segment is the repo name and not a reserved application route
    if (isGitHubPages && repo && !['admin', 'user', 'login', 'register', 'index.html', '404.html'].includes(repo)) {
        return '/' + repo;
    }
    return '';
}

/**
 * Returns the full base URL including origin.
 * @returns {string} The base URL (e.g., 'https://user.github.io/Dell-Cake' or 'http://localhost:3000')
 */
export function getBaseURL() {
    return window.location.origin + getBasePath();
}

/**
 * Normalizes a path by ensuring it starts with the base path.
 * @param {string} targetPath The path to normalize (e.g., '/admin/')
 * @returns {string} The normalized path
 */
export function normalizePath(targetPath) {
    const base = getBasePath();
    if (targetPath.startsWith(base)) return targetPath;
    return base + (targetPath.startsWith('/') ? targetPath : '/' + targetPath);
}
