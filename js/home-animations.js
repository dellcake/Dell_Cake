/* =========================
   انیمیشن صفحه اصلی
========================= */

const intro = document.getElementById("introBox");
const contactText = document.getElementById("contactText");
const buttons = document.getElementById("buttons");
const gallery = document.getElementById("gallerySection");

if (intro) {
    setTimeout(() => {
        intro.classList.add("show");
        intro.classList.remove("hidden");
    }, 500);
}

if (contactText) {
    setTimeout(() => {
        contactText.classList.add("show");
        contactText.classList.remove("hidden");
    }, 1000);
}

if (buttons) {
    setTimeout(() => {
        buttons.classList.add("show");
        buttons.classList.remove("hidden");
    }, 1500);
}

if (gallery) {
    setTimeout(() => {
        gallery.classList.add("show");
        gallery.classList.remove("hidden");
    }, 2000);
}
