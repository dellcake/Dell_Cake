const logo = document.getElementById("logoBox");
const intro = document.getElementById("introBox");
const buttons = document.getElementById("buttons");
const contactText = document.getElementById("contactText");
const gallerySection =
document.getElementById("gallerySection");

setTimeout(() => {
  logo.classList.remove("hidden");
  logo.classList.add("logoAnimate");
}, 300);

setTimeout(() => {
  intro.classList.remove("hidden");
  intro.classList.add("show");
}, 1400);

setTimeout(() => {

  contactText.classList.remove("hidden");
  contactText.classList.add("show");

  buttons.classList.remove("hidden");
  buttons.classList.add("show");

}, 2800);

setTimeout(() => {
    gallerySection.classList.add("show");
}, 3900);

document.addEventListener("DOMContentLoaded", () => {

  new Swiper(".promoSwiper", {

    effect: "slide",

    loop: true,

    grabCursor: true,

    centeredSlides: true,

    autoplay: {
      delay: 3500,
      disableOnInteraction: false,
    },

    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    }

  });

});
