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
orderForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(orderForm);

  try {
    const res = await fetch("https://dellcake.gt.tc/save-order.php", {
      method: "POST",
      body: formData
    });

    const text = await res.text();
    console.log("SERVER RAW RESPONSE:", text);

    let result;
    try {
      result = JSON.parse(text);
    } catch (err) {
      throw new Error("Invalid JSON from server");
    }

    if (result.status === "success") {
      successMessage.style.display = "block";
      orderForm.reset();

      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
      });

    } else {
      alert("Server error: " + JSON.stringify(result));
    }

  } catch (err) {
    console.log(err);
    alert("مشکل واقعی سرور / CORS / HTTPS");
  }
});


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
