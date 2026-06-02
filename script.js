const logo = document.getElementById("logoBox");
const intro = document.getElementById("introBox");
const buttons = document.getElementById("buttons");

setTimeout(() => {
  logo.classList.remove("hidden");
  logo.classList.add("logoAnimate");
}, 300);

setTimeout(() => {
  intro.classList.remove("hidden");
  intro.classList.add("show");
}, 1200);

setTimeout(() => {
  buttons.classList.remove("hidden");
  buttons.classList.add("show");
}, 2600);

document.addEventListener("DOMContentLoaded", () => {

  new Swiper(".promoSwiper", {
    effect: "cards",
    grabCursor: true,
    loop: true,

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
