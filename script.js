/* =========================
   انیمیشن صفحه اصلی
========================= */

const logo =
document.getElementById("logoBox");

const intro =
document.getElementById("introBox");

const buttons =
document.getElementById("buttons");

const contactText =
document.getElementById("contactText");

const gallerySection =
document.getElementById("gallerySection");

if (logo) {

setTimeout(() => {

logo.classList.remove("hidden");
logo.classList.add("logoAnimate");

},300);

}

if (intro) {

setTimeout(() => {

intro.classList.remove("hidden");
intro.classList.add("show");

},1400);

}

if (contactText && buttons) {

setTimeout(() => {

contactText.classList.remove("hidden");
contactText.classList.add("show");

buttons.classList.remove("hidden");
buttons.classList.add("show");

},2800);

}

if (gallerySection) {

setTimeout(() => {

gallerySection.classList.add("show");

},3900);

}


/* =========================
   بعد از لود صفحه
========================= */

document.addEventListener("DOMContentLoaded",()=>{


/* =========================
   منوی کناری
========================= */

const menuBtn =
document.querySelector(".menu-btn");

const sideMenu =
document.getElementById("sideMenu");

const overlay =
document.getElementById("menuOverlay");

if(menuBtn && sideMenu){

menuBtn.addEventListener("click",()=>{

sideMenu.classList.toggle("active");

if(overlay){

overlay.classList.toggle("active");

}

});

}

if(overlay){

overlay.addEventListener("click",()=>{

sideMenu.classList.remove("active");
overlay.classList.remove("active");

});

}


/* =========================
   نمایش فیلدهای سفارش
========================= */

const cakeType =
document.getElementById("cakeType");

if(cakeType){

const sections={

birthday:
document.getElementById("birthdayFields"),

kids:
document.getElementById("kidsFields"),

engagement:
document.getElementById("engagementFields"),

wedding:
document.getElementById("weddingFields"),

custom:
document.getElementById("customCakeFields")

};

cakeType.addEventListener("change",()=>{

Object.values(sections).forEach(el=>{

if(el){

el.style.display="none";

}

});

if(sections[cakeType.value]){

sections[cakeType.value]
.style.display="block";

}

});

}


/* =========================
   تقویم شمسی
========================= */

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

if(calendarBtn && deliveryDate){

calendarBtn.addEventListener("click",()=>{

deliveryDate.focus();
deliveryDate.click();

});

}


/* =========================
   ثبت سفارش → بله
========================= */

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

const description =
document.getElementById("orderDescription");


if(!name.value.trim()){

alert("نام و نام خانوادگی را وارد کنید");

return;

}


const phoneRegex =
/^09\d{9}$/;

if(
!phoneRegex.test(
phone.value.trim()
)
){

alert(
"شماره تماس را صحیح وارد کنید"
);

return;

}


if(!date.value.trim()){

alert(
"تاریخ تحویل را انتخاب کنید"
);

return;

}


const message =

`🎂 سفارش جدید دل‌کیک

👤 نام:
${name.value}

📞 شماره تماس:
${phone.value}

🍰 نوع کیک:
${cake.options[cake.selectedIndex].text}

📅 تاریخ تحویل:
${date.value}

📝 توضیحات:
${description.value || "-"}`;


window.open(

`https://ble.ir/dellcake_pv?text=${encodeURIComponent(message)}`,

"_blank"

);

});

}


});
📞 تماس:
${phone.value}

🍰 نوع کیک:
${cakeType.value}

📅 تاریخ تحویل:
${date.value}

📝 توضیحات:
${description.value}
`;

const url =
`https://ble.ir/dellcake_pv?text=${encodeURIComponent(message)}`;

window.location.href=url;

});

}


/* باز شدن تقویم با کلیک روی آیکون */

document.addEventListener("DOMContentLoaded", () => {

const deliveryDate =
document.getElementById("deliveryDate");

const calendarBtn =
document.getElementById("calendarBtn");

if(calendarBtn && deliveryDate){

calendarBtn.addEventListener("click",()=>{

deliveryDate.focus();

if(deliveryDate.showPicker){

deliveryDate.showPicker();

}

});

}

});
/* تقویم شمسی */

$(document).ready(function(){

if($("#deliveryDate").length){

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

});
const calendarBtn =
document.getElementById("calendarBtn");

const dateInput =
document.getElementById("deliveryDate");

if(calendarBtn && deliveryDate){

calendarBtn.addEventListener("click",()=>{

deliveryDate.focus();

deliveryDate.click();

});

}
console.log(document.getElementById("customerName"));
