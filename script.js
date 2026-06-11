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
const orderForm =
document.getElementById("orderForm");

const successMessage =
document.getElementById("successMessage");

if(orderForm){

orderForm.addEventListener("submit",(e)=>{

e.preventDefault();

const name =
orderForm.querySelector('input[type="text"]');

const phone =
orderForm.querySelector('input[type="tel"]');

const date =
document.getElementById("deliveryDate");

if(name.value.trim()===""){

alert("نام و نام خانوادگی را وارد کنید");

return;

}

const phonePattern = /^09\d{9}$/;

if(!phonePattern.test(phone.value.trim())){

alert("شماره تماس را به صورت 09xxxxxxxxx وارد کنید");

return;

}
if(date.value.trim()===""){

alert("تاریخ تحویل را وارد کنید");

return;

}

successMessage.style.display="block";

orderForm.reset();

window.scrollTo({

top:document.body.scrollHeight,

behavior:"smooth"

});

});

}
/* باز شدن تقویم با کلیک روی آیکون */

document.addEventListener("DOMContentLoaded", () => {

const deliveryDate =
document.getElementById("deliveryDate");

const calendarIcon =
document.getElementById("calendarIcon");

if(deliveryDate && calendarIcon){

calendarIcon.addEventListener("click",()=>{

if(deliveryDate.showPicker){

deliveryDate.showPicker();

}else{

deliveryDate.focus();

deliveryDate.click();

}

});

}

});

/* تقویم شمسی */

$(document).ready(function () {

if ($("#deliveryDate").length) {

$("#deliveryDate").persianDatepicker({

format: "YYYY/MM/DD",

initialValue: false,

autoClose: true,

minDate: new persianDate().valueOf(),

calendar:{
persian:{
locale:"fa"
}
},

toolbox:{
calendarSwitch:{
enabled:false
}
}

});

}

});
const calendarBtn =
document.getElementById("calendarBtn");

const deliveryDate =
document.getElementById("deliveryDate");

if(calendarBtn && deliveryDate){

calendarBtn.addEventListener("click",()=>{

deliveryDate.focus();

deliveryDate.click();

});

}

});
