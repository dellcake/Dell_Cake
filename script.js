const logo = document.getElementById("logoBox");
const intro = document.getElementById("introBox");
const buttons = document.getElementById("buttons");
const contactText = document.getElementById("contactText");
const gallerySection = document.getElementById("gallerySection");

/* انیمیشن صفحه اصلی */

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

/* منوی کناری */

document.addEventListener("DOMContentLoaded", () => {

    const menuBtn =
    document.querySelector(".menu-btn");

    const sideMenu =
    document.querySelector("#sideMenu");

    const overlay =
    document.querySelector("#menuOverlay");

    if(menuBtn && sideMenu){

        menuBtn.addEventListener("click", () => {

            sideMenu.classList.toggle("active");

            if(overlay){
                overlay.classList.toggle("active");
            }

        });

    }

    if(overlay){

        overlay.addEventListener("click", () => {

            sideMenu.classList.remove("active");
            overlay.classList.remove("active");

        });

    }

});
const cakeType =
document.getElementById("cakeType");

if(cakeType){

const customFields =
document.getElementById("customCakeFields");

const birthdayFields =
document.getElementById("birthdayFields");

const kidsFields =
document.getElementById("kidsFields");

const engagementFields =
document.getElementById("engagementFields");

const weddingFields =
document.getElementById("weddingFields");

cakeType.addEventListener("change",()=>{

if(customFields)
customFields.style.display = "none";

if(birthdayFields)
birthdayFields.style.display = "none";

if(kidsFields)
kidsFields.style.display = "none";

if(engagementFields)
engagementFields.style.display = "none";

if(weddingFields)
weddingFields.style.display = "none";


if(cakeType.value === "custom"){

customFields.style.display = "block";

}

if(cakeType.value === "birthday"){

birthdayFields.style.display = "block";

}

if(cakeType.value === "kids"){

kidsFields.style.display = "block";

}

if(cakeType.value === "engagement"){

engagementFields.style.display = "block";

}

if(cakeType.value === "wedding"){

weddingFields.style.display = "block";

}

});

}
