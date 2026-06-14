document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       منوی کناری
    ========================= */

    const menuBtn = document.querySelector(".menu-btn");
    const sideMenu = document.getElementById("sideMenu");
    const overlay = document.getElementById("menuOverlay");

    if (menuBtn && sideMenu && overlay) {

        menuBtn.addEventListener("click", () => {
            sideMenu.classList.toggle("active");
            overlay.classList.toggle("active");
        });

        overlay.addEventListener("click", () => {
            sideMenu.classList.remove("active");
            overlay.classList.remove("active");
        });

    }


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


    /* =========================
       نمایش فیلدهای نوع کیک
    ========================= */

    const cakeType = document.getElementById("cakeType");

    if (cakeType) {

        const sections = [
            "birthdayFields",
            "kidsFields",
            "engagementFields",
            "weddingFields",
            "customCakeFields"
        ];

        cakeType.addEventListener("change", () => {

            sections.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = "none";
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


    /* =========================
       تقویم شمسی
    ========================= */

    if (
        window.jQuery &&
        $("#deliveryDate").length &&
        $.fn.persianDatepicker
    ) {

        $("#deliveryDate").persianDatepicker({
            format: "YYYY/MM/DD",
            initialValue: false,
            autoClose: true,
            calendar: {
                persian: { locale: "fa" }
            },
            toolbox: {
                calendarSwitch: { enabled: false }
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


    /* =========================
       ثبت سفارش (FIXED کامل)
    ========================= */

    const orderForm = document.getElementById("orderForm");

    if (orderForm) {

        orderForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const name = document.getElementById("customerName");
            const phone = document.getElementById("customerPhone");
            const cake = document.getElementById("cakeType");
            const weight = document.getElementById("cakeWeight");
            const date = document.getElementById("deliveryDate");
            const time = document.getElementById("deliveryTime");
            const description = document.getElementById("orderDescription");
            const successMessage = document.getElementById("successMessage");
const birthdayImage = document.getElementById("birthdayImage")?.files[0];
const kidImage = document.getElementById("kidImage")?.files[0];
const engagementImage = document.getElementById("engagementImage")?.files[0];
const weddingImage = document.getElementById("weddingImage")?.files[0];
const customImage = document.getElementById("customImage")?.files[0];

const imageFile =
birthdayImage || kidImage || engagementImage || weddingImage || customImage;

            
            /* ================= VALIDATION ================= */

            if (!name?.value.trim()) {
                alert("نام و نام خانوادگی را وارد کنید");
                return;
            }

            const phoneValue = phone?.value.trim().replace(/\s+/g, "");

            if (!/^09\d{9}$/.test(phoneValue)) {
                alert("شماره تماس معتبر نیست");
                return;
            }

            if (!cake?.value) {
                alert("نوع کیک را انتخاب کنید");
                return;
            }

            if (!date?.value.trim()) {
                alert("تاریخ تحویل را انتخاب کنید");
                return;
            }

            /* ================= SAFE DATA ================= */

            const cakeText =
                cake.options[cake.selectedIndex]?.text || "ثبت نشده";

let flavor = "";
let filling = "";
let design = "";
let colors = "";
let cakeTextOnCake = "";

switch (cake.value) {

    case "birthday":
        flavor = document.getElementById("birthdayFlavor")?.value || "";
        filling = document.getElementById("birthdayFilling")?.value || "";
        design = document.getElementById("birthdayDesign")?.value || "";
        colors = document.getElementById("birthdayColors")?.value || "";
        cakeTextOnCake = document.getElementById("birthdayText")?.value || "";
        break;

    case "kids":
        flavor = document.getElementById("kidFlavor")?.value || "";
        filling = document.getElementById("kidFilling")?.value || "";
        design = document.getElementById("kidDesign")?.value || "";
        colors = document.getElementById("kidColors")?.value || "";
        break;

    case "engagement":
        flavor = document.getElementById("engagementFlavor")?.value || "";
        filling = document.getElementById("engagementFilling")?.value || "";
        design = document.getElementById("engagementDesign")?.value || "";
        colors = document.getElementById("engagementTheme")?.value || "";
        cakeTextOnCake = document.getElementById("engagementText")?.value || "";
        break;

    case "wedding":
        flavor = document.getElementById("weddingFlavor")?.value || "";
        filling = document.getElementById("weddingFilling")?.value || "";
        design = document.getElementById("weddingDesign")?.value || "";
        colors = document.getElementById("weddingColors")?.value || "";
        break;

    case "custom":
        flavor = document.getElementById("customFlavor")?.value || "";
        filling = document.getElementById("customFilling")?.value || "";
        design = document.getElementById("customDesign")?.value || "";
        colors = document.getElementById("customColors")?.value || "";
        cakeTextOnCake = document.getElementById("customText")?.value || "";
        break;
}
            
          const message = `🎂 سفارش جدید دل‌کیک

━━━━━━━━━━━━━━━━━━

👤 نام مشتری:
${name.value}

📞 شماره تماس:
${phoneValue}

🍰 نوع کیک:
${cakeText}

🎂 طعم کیک:
${flavor || "ثبت نشده"}

🍫 فیلینگ:
${filling || "ثبت نشده"}

🎨 سبک طراحی:
${design || "ثبت نشده"}

🌈 رنگ‌بندی:
${colors || "ثبت نشده"}

✍️ متن روی کیک:
${cakeTextOnCake || "ثبت نشده"}

⚖️ وزن:
${weight?.value || "ثبت نشده"} کیلوگرم

📅 تاریخ تحویل:
${date.value}

🕒 ساعت تحویل:
${time?.value || "ثبت نشده"}

📝 توضیحات:
${description?.value || "ثبت نشده"}

━━━━━━━━━━━━━━━━━━

💖 Dell Cake`;
            /* ================= FETCH ================= */

            try {
                
      /* نمایش فوری پیام موفقیت */
                
                if (successMessage) {
                    successMessage.style.display = "block";
                    successMessage.scrollIntoView({ behavior: "smooth" });
                }

   /* ذخیره سفارش در گوگل شیت */
                
  await fetch("https://script.google.com/macros/s/AKfycbzikTh4NWHAJ8SVdl43w7TbGaN5ovYilxFQxQwIUHGdK8SFflPqyHhQ9WOHE8Y5eIlY/exec", {
       method: "POST",
    
body: const formData = new FormData();

// 🔹 متن‌ها
formData.append("name", name.value);
formData.append("phone", phoneValue);
formData.append("cake", cakeText);
formData.append("flavor", flavor);
formData.append("filling", filling);
formData.append("design", design);
formData.append("colors", colors);
formData.append("cakeText", cakeTextOnCake);
formData.append("weight", weight?.value || "");
formData.append("date", date.value);
formData.append("time", time?.value || "");
formData.append("description", description?.value || "");        

// 🔹 فایل تصویر (این قسمت مهمه)
const imageInput = document.getElementById("birthdayImage")?.files[0]
  || document.getElementById("kidImage")?.files[0]
  || document.getElementById("engagementImage")?.files[0]
  || document.getElementById("weddingImage")?.files[0]
  || document.getElementById("customImage")?.files[0];

if (imageInput) {
  formData.append("image", imageInput);
}
                });

                
    /* انتقال به بله بعد از 1 ثانیه */

                setTimeout(() => {
                    window.location.href =
                        `https://ble.ir/dellcake_pv?text=${encodeURIComponent(message)}`;
                }, 500);

            } catch (error) {
                console.error(error);
                alert("خطا در ثبت سفارش");
            }
        });
    }

});
