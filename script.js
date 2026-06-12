/* =====================================
   Dell Cake - Main Script
===================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ==========================
       MENU
    ========================== */

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


    /* ==========================
       HOME PAGE ANIMATIONS
    ========================== */

    const intro = document.getElementById("introBox");
    const contactText = document.getElementById("contactText");
    const buttons = document.getElementById("buttons");
    const gallery = document.getElementById("gallerySection");

    if (intro) {

        setTimeout(() => {

            intro.classList.remove("hidden");
            intro.classList.add("show");

        }, 600);

    }

    if (contactText) {

        setTimeout(() => {

            contactText.classList.remove("hidden");
            contactText.classList.add("show");

        }, 1200);

    }

    if (buttons) {

        setTimeout(() => {

            buttons.classList.remove("hidden");
            buttons.classList.add("show");

        }, 1800);

    }

    if (gallery) {

        setTimeout(() => {

            gallery.classList.remove("hidden");
            gallery.classList.add("show");

        }, 2400);

    }


    /* ==========================
       CAKE TYPE FIELDS
    ========================== */

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

            const fieldMap = {

                birthday: "birthdayFields",
                kids: "kidsFields",
                engagement: "engagementFields",
                wedding: "weddingFields",
                custom: "customCakeFields"

            };

            const target =
                document.getElementById(
                    fieldMap[cakeType.value]
                );

            if (target) {
                target.style.display = "block";
            }

        });

    }


    /* ==========================
       PERSIAN DATE PICKER
    ========================== */

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


    /* ==========================
       ORDER FORM
    ========================== */

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


            if (!name.value.trim()) {

                alert("نام و نام خانوادگی را وارد کنید");
                return;

            }

            if (!/^09\d{9}$/.test(phone.value.trim())) {

                alert("شماره تماس معتبر نیست");
                return;

            }

            if (!cake.value) {

                alert("نوع کیک را انتخاب کنید");
                return;

            }

            if (!date.value.trim()) {

                alert("تاریخ تحویل را انتخاب کنید");
                return;

            }


            const cakeText =
                cake.options[cake.selectedIndex].text;

            const message = `🎂 سفارش جدید دل‌کیک

👤 نام:
${name.value}

📞 شماره تماس:
${phone.value}

🍰 نوع کیک:
${cakeText}

👥 تعداد نفرات:
${guest?.value || "ثبت نشده"}

📅 تاریخ تحویل:
${date.value}

🕒 ساعت تحویل:
${time?.value || "ثبت نشده"}

📝 توضیحات:
${description?.value || "ثبت نشده"}

💖 ارسال از سایت دل‌کیک`;



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

});        menuBtn.addEventListener("click", () => {
            sideMenu?.classList.toggle("active");
            overlay?.classList.toggle("active");
        });
    }

    if (overlay) {
        overlay.addEventListener("click", () => {
            sideMenu?.classList.remove("active");
            overlay?.classList.remove("active");
        });
    }


    /* =====================
    نمایش فیلدهای کیک
    ===================== */

    const cakeType = document.getElementById("cakeType");

    if (cakeType) {

        cakeType.addEventListener("change", () => {

            [
                "birthdayFields",
                "kidsFields",
                "engagementFields",
                "weddingFields",
                "customCakeFields"
            ].forEach(id => {

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

            const target = document.getElementById(
                map[cakeType.value]
            );

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


    /* =====================
    ثبت سفارش
    ===================== */

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

            const guest =
                document.getElementById("guestCount");

            const date =
                document.getElementById("deliveryDate");

            const time =
                document.getElementById("deliveryTime");

            const description =
                document.getElementById("orderDescription");

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
                cake.options[cake.selectedIndex]?.text || "ثبت نشده";

            const message =

`🎂 سفارش جدید دل‌کیک

━━━━━━━━━━━━━━━━

🧾 اطلاعات مشتری

👤 نام و نام خانوادگی:
${name.value}

📞 شماره تماس:
${phone.value}

━━━━━━━━━━━━━━━━

🍰 اطلاعات سفارش

🎂 نوع کیک:
${cakeText}

👥 تعداد نفرات:
${guest?.value || "ثبت نشده"}

📅 تاریخ تحویل:
${date.value}

🕒 ساعت حدودی تحویل:
${time?.value || "ثبت نشده"}

━━━━━━━━━━━━━━━━

📝 توضیحات سفارش

${description?.value || "ثبت نشده"}

━━━━━━━━━━━━━━━━

💖 ثبت شده از سایت دل‌کیک`;

            window.location.href =
                `https://ble.ir/dellcake_pv?text=${encodeURIComponent(message)}`;

        });

    }

});
