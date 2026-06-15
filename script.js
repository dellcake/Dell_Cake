(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", () => {

        try {
            initMenu();
            initAnimations();
            initCakeType();
            initCalendar();
            initForm();
        } catch (err) {
            console.error("Init error:", err);
        }

    });

    /* =========================
       منوی کناری (SAFE)
    ========================= */

    function initMenu() {
        const menuBtn = document.querySelector(".menu-btn");
        const sideMenu = document.getElementById("sideMenu");
        const overlay = document.getElementById("menuOverlay");

        if (!menuBtn || !sideMenu || !overlay) return;

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
       انیمیشن‌ها (SAFE)
    ========================= */

    function initAnimations() {
        const items = [
            "introBox",
            "contactText",
            "buttons",
            "gallerySection"
        ];

        const delays = [500, 1000, 1500, 2000];

        items.forEach((id, i) => {
            const el = document.getElementById(id);
            if (!el) return;

            setTimeout(() => {
                el.classList.add("show");
                el.classList.remove("hidden");
            }, delays[i]);
        });
    }

    /* =========================
       فیلدهای کیک (SAFE)
    ========================= */

    function initCakeType() {
        const cakeType = document.getElementById("cakeType");
        if (!cakeType) return;

        const sections = {
            birthday: "birthdayFields",
            kids: "kidsFields",
            engagement: "engagementFields",
            wedding: "weddingFields",
            custom: "customCakeFields"
        };

        cakeType.addEventListener("change", () => {

            Object.values(sections).forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = "none";
            });

            const selected = document.getElementById(sections[cakeType.value]);
            if (selected) selected.style.display = "block";
        });
    }

    /* =========================
       تقویم (SAFE)
    ========================= */

    function initCalendar() {

        if (!window.jQuery) return;
        if (!$("#deliveryDate").length) return;
        if (!$.fn.persianDatepicker) return;

        $("#deliveryDate").persianDatepicker({
            format: "YYYY/MM/DD",
            initialValue: false,
            autoClose: true,
            calendar: {
                persian: { locale: "fa" }
            }
        });

        const btn = document.getElementById("calendarBtn");
        const input = document.getElementById("deliveryDate");

        if (btn && input) {
            btn.addEventListener("click", () => {
                input.focus();
                const picker = $(input).data("datepicker");
                if (picker) picker.show();
            });
        }
    }

    /* =========================
       فرم سفارش (CRASH PROOF)
    ========================= */

    function initForm() {
        const form = document.getElementById("orderForm");
        if (!form) return;

        form.addEventListener("submit", (e) => {
            e.preventDefault();
            shareOrderSafe();
        });
    }

    function getValue(id) {
        const el = document.getElementById(id);
        return el ? el.value.trim() : "";
    }

    function shareOrderSafe() {

        try {

            const name = getValue("customerName");
            const phone = getValue("customerPhone");
            const type = getValue("cakeType");

            if (!name || !phone || !type) {
                alert("لطفاً اطلاعات ضروری را کامل کنید 💗");
                return;
            }

            const typeMap = {
                birthday: "کیک تولد 🎂",
                kids: "کیک کودک 🧸",
                engagement: "کیک نامزدی 💍",
                wedding: "کیک عروسی 👰",
                custom: "کیک سفارشی ✨"
            };

            let message =
                "💗 سفارش جدید دل‌کیک\n\n" +
                `👤 نام: ${name}\n` +
                `📞 شماره: ${phone}\n` +
                `🎂 نوع: ${typeMap[type] || type}\n\n`;

            const url =
                "https://ble.ir/dellcake_pv?text=" +
                encodeURIComponent(message);

            if (navigator.share) {
                navigator.share({
                    title: "سفارش دل‌کیک",
                    text: message
                }).catch(() => {});
            } else {
                window.open(url, "_blank");
            }

            // PDF جدا و امن (اگر وجود داشت)
            if (typeof window.createOrderPDF === "function") {
                window.createOrderPDF({ name, phone, type });
            }

        } catch (err) {
            console.error("shareOrder error:", err);
        }
    }

})();
