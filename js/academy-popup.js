/**
 * Outdated Academy Popup System - Replaced with Failsafe Redirect Engine
 * Automatically routes legacy popup triggers to the dynamic independent academy.html
 */
window.openAcademyPopup = function() {
    window.location.href = "academy.html";
    return false;
};

document.addEventListener('DOMContentLoaded', () => {
    // If there is any leftover modal backdrop or element, remove it gracefully
    const outdatedPopup = document.querySelector('.academy-popup-box');
    if (outdatedPopup) {
        outdatedPopup.remove();
    }
});
