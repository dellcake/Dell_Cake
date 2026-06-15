document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       جلوگیری از اجرای دوباره
    ========================= */
    if (window.__DELCAKE_INIT__) return;
    window.__DELCAKE_INIT__ = true;

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
       نمایش فیلدهای کیک (FIXED)
    ========================= */

    const cakeType = document.getElementById("cakeType");

    const sections = {
        birthday: "birthdayFields",
        kids: "kidsFields",
        engagement: "engagementFields",
        wedding: "weddingFields",
        custom: "customCakeFields"
    };

    function hideAll() {
        Object.values(sections).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = "none";
        });
    }

    function showSelected(value) {
        const el = document.getElementById(sections[value]);
        if (el) el.style.display = "block";
    }

    if (cakeType) {
        cakeType.addEventListener("change", (e) => {
            hideAll();
            showSelected(e.target.value);
        });
    }

    /* =========================
       تقویم شمسی (FIXED + SAFE)
    ========================= */

    function initCalendar() {

        if (!window.jQuery) return;
        if (!$.fn || !$.fn.persianDatepicker) return;

        const $el = $("#deliveryDate");
        if (!$el.length) return;

        try {
            $el.persianDatepicker({
                format: "YYYY/MM/DD",
                initialValue: false,
                autoClose: true,
                calendar: {
                    persian: { locale: "fa" }
                }
            });

            const btn = document.getElementById("calendarBtn");

            if (btn) {
                btn.addEventListener("click", () => {
                    $el.focus();
                    const picker = $el.data("datepicker");
                    if (picker) picker.show();
                });
            }

        } catch (err) {
            console.error("Datepicker error:", err);
        }
    }

    initCalendar();

});
