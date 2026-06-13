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
            intro.classList.remove("hidden");
            intro.classList.add("show");
        }, 500);
    }

    if (contactText) {
        setTimeout(() => {
            contactText.classList.remove("hidden");
            contactText.classList.add("show");
        }, 1000);
    }

    if (buttons) {
        setTimeout(() => {
            buttons.classList.remove("hidden");
            buttons.classList.add("show");
        }, 1500);
    }

    if (gallery) {
        setTimeout(() => {
            gallery.classList.remove("hidden");
            gallery.classList.add("show");
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

            const target =
                document.getElementById(
                    map[cakeType.value]
                );

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

    const calendarBtn =
        document.getElementById("calendarBtn");

    const deliveryDate =
        document.getElementById("deliveryDate");

    if (calendarBtn && deliveryDate) {

        calendarBtn.addEventListener("click", () => {
            deliveryDate.focus();
            deliveryDate.click();
        });

    }

    /* =========================
       ثبت سفارش
    ========================= */

    const orderForm =
        document.getElementById("orderForm");

    if (orderForm) {

        orderForm.addEventListener("submit", (e) => {

            e.preventDefault();

            const name =
                document.getElementById("customerName");

            const phone =
                document.getElementById("customerPhone");

            const cake =
                document.getElementById("cakeType");

            const weight =
               document.getElementById("cakeWeight");

            const guest =
                document.getElementById("guestCount");

            const date =
                document.getElementById("deliveryDate");

            const time =
                document.getElementById("deliveryTime");

            const description =
                document.getElementById("orderDescription");

            const successMessage =
                document.getElementById("successMessage");

            

            if (!name || !name.value.trim()) {
                alert("نام و نام خانوادگی را وارد کنید");
                return;
            }

            if (!phone || !/^09\\d{9}$/.test(phone.value.trim())) {
                alert("شماره تماس معتبر نیست");
                return;
            }

            if (!cake || !cake.value) {
                alert("نوع کیک را انتخاب کنید");
                return;
            }

            if (!date || !date.value.trim()) {
                alert("تاریخ تحویل را انتخاب کنید");
                return;
            }

fetch(
    "https://script.google.com/macros/s/AKfycbyKJtwVP2B1HeA-3qaKSNZ2TTtd95zA3CX2gGgGoWrbIT346oGP46cYaEGuo3Ob62T7/exec",
    {
        method: "POST",
        body: JSON.stringify({
            name: name.value,
            phone: phone.value,
            cake: cakeText,
            weight: weight?.value || "",
            guest: guest?.value || "",
            date: date.value,
            time: time?.value || "",
            description: description?.value || ""
        })
    }
)
.then(() => {

    if (success) {
        success.style.display = "block";
    }

    setTimeout(() => {

        window.location.href =
            `https://ble.ir/dellcake_pv?text=${encodeURIComponent(message)}`;

    }, 2000);

})
.catch(error => {

    console.error(error);

    alert("خطا در ثبت سفارش");

});
            
            const cakeText =
                cake.options[cake.selectedIndex]?.text || "ثبت نشده";

            const message = `🎂 سفارش جدید دل‌کیک

━━━━━━━━━━━━━━━━

👤 نام:
${name.value}

📞 شماره تماس:
${phone.value}

🍰 نوع کیک:
${cakeText}

⚖️ وزن کیک:
${weight?.value || "ثبت نشده"} کیلوگرم

👥 تعداد نفرات:
${guest?.value || "ثبت نشده"}

📅 تاریخ تحویل:
${date.value}

🕒 ساعت تحویل:
${time?.value || "ثبت نشده"}

📝 توضیحات:
${description?.value || "ثبت نشده"}

━━━━━━━━━━━━━━━━

💖 ثبت شده از سایت دل‌کیک`;

            if (successMessage) {
                successMessage.style.display = "block";

                successMessage.scrollIntoView({
                    behavior: "smooth"
                });
            }

            setTimeout(() => {

                window.location.href =
                    `https://ble.ir/dellcake_pv?text=${encodeURIComponent(message)}`;

            }, 3000);

        });

    }

});
