const logo = document.getElementById("logoBox");
const intro = document.getElementById("introBox");
const buttons = document.getElementById("buttons");
const contactText = document.getElementById("contactText");
const gallerySection = document.getElementById("gallerySection");


  if(document.querySelector('.promoSwiper')){

    const swiper = new Swiper('.promoSwiper', {

        loop:true,

        autoplay:{
            delay:3500,
            disableOnInteraction:false
        },

        pagination:{
            el:'.swiper-pagination',
            clickable:true
        }

    });

}
    },

    breakpoints:{

        0:{
            slidesPerView:1,
            spaceBetween:15
        },

        768:{
            slidesPerView:2,
            spaceBetween:20
        },

        1200:{
            slidesPerView:4,
            spaceBetween:25
        }

    }

});

if (logo) {

    setTimeout(() => {

        logo.classList.remove("hidden");
        logo.classList.add("logoAnimate");

    }, 300);

}

if (intro) {

    setTimeout(() => {

        intro.classList.remove("hidden");
        intro.classList.add("show");

    }, 1400);

}

if (contactText && buttons) {

    setTimeout(() => {

        contactText.classList.remove("hidden");
        contactText.classList.add("show");

        buttons.classList.remove("hidden");
        buttons.classList.add("show");

    }, 2800);

}

if (gallerySection) {

    setTimeout(() => {

        gallerySection.classList.add("show");

    }, 3900);

}

document.addEventListener("DOMContentLoaded", () => {

    const menuBtn =
    document.querySelector(".menu-btn");

    const sideMenu =
    document.querySelector("#sideMenu");

    if(menuBtn && sideMenu){

        menuBtn.addEventListener("click", () => {

            sideMenu.classList.toggle("active");

        });
document.addEventListener("DOMContentLoaded", () => {

    const menuBtn =
    document.querySelector(".menu-btn");

    const sideMenu =
    document.querySelector("#sideMenu");

    if(menuBtn && sideMenu){

        menuBtn.addEventListener("click", () => {

            sideMenu.classList.toggle("active");

        });

    }

});
    }

});
