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
       انیمیشن صفحه
    ========================= */
    const animate = (id, delay) => {
        const el = document.getElementById(id);
        if (!el) return;

        setTimeout(() => {
            el.classList.add("show");
            el.classList.remove("hidden");
        }, delay);
    };

    animate("introBox", 500);
    animate("contactText", 1000);
    animate("buttons", 1500);
    animate("gallerySection", 2000);

    /* =========================
       نمایش فیلدهای کیک
    ========================= */
    const cakeType = document.getElementById("cakeType");

    const sections = {
        birthday: "birthdayFields",
        kids: "kidsFields",
        engagement: "engagementFields",
        wedding: "weddingFields",
        custom: "customCakeFields"
    };

    function hideAllCakeSections() {
        Object.values(sections).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = "none";
        });
    }

    function showSelectedSection(value) {
        const el = document.getElementById(sections[value]);
        if (el) el.style.display = "block";
    }

    if (cakeType) {
        cakeType.addEventListener("change", (e) => {
            hideAllCakeSections();
            showSelectedSection(e.target.value);
        });
    }

    /* =========================
       تقویم شمسی (SAFE INIT)
    ========================= */

    function initCalendar() {
        try {
            if (window.jQuery && $.fn.persianDatepicker) {
                const el = $("#deliveryDate");

                if (el.length) {
                    el.persianDatepicker({
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
            }
        } catch (err) {
            console.log("Calendar init failed:", err);
        }
    }

    initCalendar();

    const calendarBtn = document.getElementById("calendarBtn");
    const deliveryDate = document.getElementById("deliveryDate");

    if (calendarBtn && deliveryDate) {
        calendarBtn.addEventListener("click", () => {
            deliveryDate.focus();

            const picker = $(deliveryDate).data("datepicker");
            if (picker) picker.show();
        });
    }

});
