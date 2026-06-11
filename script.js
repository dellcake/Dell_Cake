/* =====================
   انیمیشن صفحه اصلی
===================== */

window.addEventListener("load", () => {

    const logo = document.getElementById("logoBox");
    const intro = document.getElementById("introBox");
    const buttons = document.getElementById("buttons");
    const contactText = document.getElementById("contactText");
    const gallery = document.getElementById("gallerySection");

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

    if (contactText) {
        setTimeout(() => {
            contactText.classList.remove("hidden");
            contactText.classList.add("show");
        }, 2800);
    }

    if (buttons) {
        setTimeout(() => {
            buttons.classList.remove("hidden");
            buttons.classList.add("show");
        }, 2800);
    }

    if (gallery) {
        setTimeout(() => {
            gallery.classList.add("show");
        }, 3900);
    }

});


document.addEventListener("DOMContentLoaded", () => {

    /* =====================
       منوی کناری
    ===================== */

    const menuBtn = document.querySelector(".menu-btn");
    const sideMenu = document.getElementById("sideMenu");
    const overlay = document.getElementById("menuOverlay");

    if (menuBtn) {

        menuBtn.addEventListener("click", () => {

            if (sideMenu) {
                sideMenu.classList.toggle("active");
            }

            if (overlay) {
                overlay.classList.toggle("active");
            }

        });

    }

    if (overlay) {

        overlay.addEventListener("click", () => {

            if (sideMenu) {
                sideMenu.classList.remove("active");
            }

            overlay.classList.remove("active");

        });

    }


    /* =====================
       نمایش فیلدهای نوع کیک
    ===================== */

    const cakeType = document.getElementById("cakeType");

    if (cakeType) {

        cakeType.addEventListener("change", () => {

            const sections = [
                "birthdayFields",
                "kidsFields",
                "engagementFields",
                "weddingFields",
                "customCakeFields"
            ];

            sections.forEach(id => {

                const el = document.getElementById(id);

                if (el) {
                    el.style.display = "none";
                }

            });

            const map = {
                birthday: "birthdayFields",
                kids: "kidsFields",
                engagement: "engagementFields",
                wedding: "weddingFields",
                custom: "customCakeFields"
            };

            const target = document.getElementById(map[cakeType.value]);

            if (target) {
                target.style.display = "block";
            }

        });

    }


    /* =====================
       تقویم شمسی
    ===================== */

    if (
        window.jQuery &&
        $("#deliveryDate").length
    ) {

        $("#deliveryDate").persianDatepicker({

            format: "YYYY/MM/DD",
            initialValue: false,
            autoClose: true,

            calendar: {
                persian: {
                    locale: "fa"
                }
            },

            toolbox: {
                calendarSwitch: {
                    enabled: false
                }
            }

        });

    }

    const calendarBtn = document.getElementById("calendarBtn");
    const deliveryDate = document.getElementById("deliveryDate");

    if (calendarBtn && deliveryDate) {

        calendarBtn.addEventListener("click", () => {

            deliveryDate.focus();
            deliveryDate.click();

        });

    }


    /* =====================
       ثبت سفارش
    ===================== */

    const orderForm = document.getElementById("orderForm");

    if (orderForm) {

        orderForm.addEventListener("submit", function (e) {

            e.preventDefault();

            const name = document.getElementById("customerName");
            const phone = document.getElementById("customerPhone");
            const cake = document.getElementById("cakeType");
            const guest = document.getElementById("guestCount");
            const date = document.getElementById("deliveryDate");
            const time = document.getElementById("deliveryTime");
            const description = document.getElementById("orderDescription");

            if (!name.value.trim()) {
                alert("نام و نام خانوادگی را وارد کنید");
                return;
            }

            if (!/^09\d{9}$/.test(phone.value.trim())) {
                alert("شماره تماس معتبر نیست");
                return;
            }

            if (!date.value.trim()) {
                alert("تاریخ تحویل را انتخاب کنید");
                return;
            }

            const cakeText =
                cake.options[cake.selectedIndex]?.text ||
                "ثبت نشده";

            const message = `🎂 سفارش جدید دل‌کیک

━━━━━━━━━━━━━━━━━━

👤 نام و نام خانوادگی:
${name.value}

📞 شماره تماس:
${phone.value}

🍰 نوع کیک:
${cakeText}

👥 تعداد نفرات:
${guest?.value || "ثبت نشده"}

📅 تاریخ تحویل:
${date.value}

🕒 ساعت حدودی تحویل:
${time?.value || "ثبت نشده"}

📝 توضیحات سفارش:
${description?.value || "ثبت نشده"}

━━━━━━━━━━━━━━━━━━

💖 ثبت شده از سایت دل‌کیک`;

            window.location.href =
                `https://ble.ir/dellcake_pv?text=${encodeURIComponent(message)}`;

        });

    }

});setTimeout(()=>{

contactText.classList.remove("hidden");
contactText.classList.add("show");

},2800);

}

if(buttons){

setTimeout(()=>{

buttons.classList.remove("hidden");
buttons.classList.add("show");

},2800);

}

if(gallery){

setTimeout(()=>{

gallery.classList.add("show");

},3900);

}

});


/* =====================
منوی کناری
===================== */

document.addEventListener("DOMContentLoaded",()=>{

const menuBtn=
document.querySelector(".menu-btn");

const sideMenu=
document.getElementById("sideMenu");

const overlay=
document.getElementById("menuOverlay");

if(menuBtn){

menuBtn.addEventListener("click",()=>{

sideMenu?.classList.toggle("active");
overlay?.classList.toggle("active");

});

}

overlay?.addEventListener("click",()=>{

sideMenu?.classList.remove("active");
overlay?.classList.remove("active");

});


/* =====================
نمایش فیلدهای کیک
===================== */

const cakeType=
document.getElementById("cakeType");

if(cakeType){

cakeType.addEventListener("change",()=>{

[
"birthdayFields",
"kidsFields",
"engagementFields",
"weddingFields",
"customCakeFields"

].forEach(id=>{

const el=document.getElementById(id);

if(el){

el.style.display="none";

}

});

const map={

birthday:"birthdayFields",
kids:"kidsFields",
engagement:"engagementFields",
wedding:"weddingFields",
custom:"customCakeFields"

};

const target=
document.getElementById(
map[cakeType.value]
);

if(target){

target.style.display="block";

}

});

}


/* =====================
تقویم شمسی
===================== */

if(
window.jQuery &&
$("#deliveryDate").length
){

$("#deliveryDate").persianDatepicker({

format:"YYYY/MM/DD",

initialValue:false,

autoClose:true,

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

const calendarBtn=
document.getElementById("calendarBtn");

const deliveryDate=
document.getElementById("deliveryDate");

if(
calendarBtn &&
deliveryDate
){

calendarBtn.addEventListener("click",()=>{

deliveryDate.focus();
deliveryDate.click();

});

}


/* =====================
ثبت سفارش → بله
===================== */

/* =====================
ثبت سفارش → بله
===================== */

const orderForm =
document.getElementById("orderForm");

if(orderForm){

orderForm.addEventListener("submit",(e)=>{

e.preventDefault();

const name =
document.getElementById("customerName");

const phone =
document.getElementById("customerPhone");

const cake =
document.getElementById("cakeType");

const guest =
document.getElementById("guestCount");

const date =
document.getElementById("deliveryDate");

const time =
document.getElementById("deliveryTime");

const description =
document.getElementById("orderDescription");


if(!name.value.trim()){

alert("نام و نام خانوادگی را وارد کنید");

return;

}


if(!/^09\d{9}$/.test(phone.value.trim())){

alert("شماره تماس معتبر نیست");

return;

}


if(!date.value.trim()){

alert("تاریخ تحویل را انتخاب کنید");

return;

}


const cakeText =
cake.options[
cake.selectedIndex
]?.text || "ثبت نشده";


const message =

`🎂 سفارش جدید دل‌کیک

━━━━━━━━━━━━━━

👤 نام و نام خانوادگی:
${name.value}

📞 شماره تماس:
${phone.value}

🍰 نوع کیک:
${cakeText}

👥 تعداد نفرات:
${guest?.value || "ثبت نشده"}

📅 تاریخ تحویل:
${date.value}

🕒 ساعت حدودی تحویل:
${time?.value || "ثبت نشده"}

📝 توضیحات سفارش:
${description?.value || "ثبت نشده"}

━━━━━━━━━━━━━━

💖 ثبت شده از سایت دل‌کیک`;


window.location.href =
`https://ble.ir/dellcake_pv?text=${encodeURIComponent(message)}`;

});

}

});intro.classList.remove("hidden");
intro.classList.add("show");

},1400);

}

if(contactText){

setTimeout(()=>{

contactText.classList.remove("hidden");
contactText.classList.add("show");

},2800);

}

if(buttons){

setTimeout(()=>{

buttons.classList.remove("hidden");
buttons.classList.add("show");

},2800);

}

if(gallery){

setTimeout(()=>{

gallery.classList.add("show");

},3900);

}

});


/* =====================
منوی کناری
===================== */

document.addEventListener("DOMContentLoaded",()=>{

const menuBtn =
document.querySelector(".menu-btn");

const sideMenu =
document.getElementById("sideMenu");

const overlay =
document.getElementById("menuOverlay");

if(menuBtn){

menuBtn.addEventListener("click",()=>{

sideMenu?.classList.toggle("active");

overlay?.classList.toggle("active");

});

}

overlay?.addEventListener("click",()=>{

sideMenu?.classList.remove("active");

overlay?.classList.remove("active");

});

});


/* =====================
نمایش فیلدهای کیک
===================== */

const cakeType =
document.getElementById("cakeType");

if(cakeType){

cakeType.addEventListener("change",()=>{

[
"birthdayFields",
"kidsFields",
"engagementFields",
"weddingFields",
"customCakeFields"
].forEach(id=>{

const el =
document.getElementById(id);

if(el){

el.style.display="none";

}

});

const target={

birthday:"birthdayFields",

kids:"kidsFields",

engagement:"engagementFields",

wedding:"weddingFields",

custom:"customCakeFields"

};

const section=
document.getElementById(
target[cakeType.value]
);

if(section){

section.style.display="block";

}

});

}


/* =====================
تقویم شمسی
===================== */

if(
window.jQuery &&
$("#deliveryDate").length
){

$("#deliveryDate").persianDatepicker({

format:"YYYY/MM/DD",

initialValue:false,

autoClose:true,

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


const calendarBtn =
document.getElementById("calendarBtn");

const deliveryDate =
document.getElementById("deliveryDate");

if(
calendarBtn &&
deliveryDate
){

calendarBtn.addEventListener("click",()=>{

deliveryDate.focus();

deliveryDate.click();

});

}


/* =====================
ثبت سفارش → بله
===================== */

const orderForm =
document.getElementById("orderForm");

if(orderForm){

orderForm.addEventListener("submit",(e)=>{

e.preventDefault();

const name =
document.getElementById("customerName");

const phone =
document.getElementById("customerPhone");

const cake =
document.getElementById("cakeType");

const date =
document.getElementById("deliveryDate");

const desc =
document.getElementById("orderDescription");

if(
!name ||
!phone ||
!date
){

return;

}

if(
!name.value.trim()
){

alert("نام را وارد کنید");

return;

}

if(
!/^09\d{9}$/
.test(phone.value)
){

alert("شماره تماس صحیح نیست");

return;

}

if(
!date.value.trim()
){

alert("تاریخ را انتخاب کنید");

return;

}

const deliveryTime =
document.getElementById("deliveryTime");

const cakeText =
cakeType.options[
cakeType.selectedIndex
].text;

const message =
const deliveryTime =
document.getElementById("deliveryTime");

const cakeText =
cakeType.options[
cakeType.selectedIndex
]?.text || "ثبت نشده";

const guestCount =
document.getElementById("guestCount");

const message =

`🎂 سفارش جدید دل‌کیک

━━━━━━━━━━━━━━━━

🧾 اطلاعات مشتری

👤 نام و نام خانوادگی:
${name.value || "ثبت نشده"}

📞 شماره تماس:
${phone.value || "ثبت نشده"}

━━━━━━━━━━━━━━━━

🍰 اطلاعات سفارش

🎂 نوع کیک:
${cakeText}

👥 تعداد نفرات:
${guestCount?.value || "ثبت نشده"}

📅 تاریخ تحویل:
${date.value || "ثبت نشده"}

🕒 ساعت حدودی تحویل:
${deliveryTime?.value || "ثبت نشده"}

━━━━━━━━━━━━━━━━

📝 توضیحات مشتری

${description.value || "توضیحی ثبت نشده"}

━━━━━━━━━━━━━━━━

💖 ارسال از سایت دل‌کیک`;

const url =
`https://ble.ir/dellcake_pv?text=${encodeURIComponent(message)}`;

window.location.href =
url;
