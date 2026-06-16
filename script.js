document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       SAFE QUERY HELPER
    ========================= */
    const $ = (id) => document.getElementById(id);

    /* =========================
       MENU
    ========================= */
    const menuBtn = document.querySelector(".menu-btn");
    const sideMenu = $("sideMenu");
    const overlay = $("menuOverlay");

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
       CAKE TYPE SWITCH (FIXED)
    ========================= */
    const cakeType = $("cakeType");

    if (cakeType) {
        const map = {
            birthday: "birthdayFields",
            kids: "kidsFields",
            engagement: "engagementFields",
            wedding: "weddingFields",
            custom: "customCakeFields"
        };

        cakeType.addEventListener("change", () => {

            Object.values(map).forEach(id => {
                const el = $(id);
                if (el) el.style.display = "none";
            });

            const target = $(map[cakeType.value]);
            if (target) target.style.display = "block";
        });
    }

    /* =========================
       CALENDAR FIX (SAFE INIT)
    ========================= */
    const deliveryDate = $("deliveryDate");
    const calendarBtn = $("calendarBtn");

    if (window.jQuery && deliveryDate && $.fn.persianDatepicker) {

        const $input = window.jQuery(deliveryDate);

        $input.persianDatepicker({
            format: "YYYY/MM/DD",
            autoClose: true,
            initialValue: false
        });

        if (calendarBtn) {
            calendarBtn.addEventListener("click", () => {
                deliveryDate.focus();

                const picker = $input.data("datepicker");

                // هیچ reliance به show() نداریم (نسخه‌ها فرق دارند)
                if (picker && picker.open) {
                    picker.open();
                }
            });
        }
    }

    /* =========================
       FORM SUBMIT
    ========================= */
    const orderForm = $("orderForm");

    if (orderForm) {
        orderForm.addEventListener("submit", (e) => {
            e.preventDefault();
            shareOrder();
        });
    }

    /* =========================
       MODAL EVENTS
    ========================= */
    $("closeShare")?.addEventListener("click", closeShareModal);

    $("shareTelegram")?.addEventListener("click", openTelegram);
    $("shareBale")?.addEventListener("click", openBale);
    $("shareSMS")?.addEventListener("click", openSMS);

    document.querySelector(".share-backdrop")?.addEventListener("click", closeShareModal);

});


/* =========================
   GLOBAL STATE
========================= */
let currentMessage = "";

/* =========================
   VIBRATION
========================= */
function vibrate() {
    if (navigator.vibrate) navigator.vibrate(50);
}

/* =========================
   SHARE ORDER
========================= */
function shareOrder() {

    const get = (id) => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : "";
    };

    const name = get("customerName");
    const phone = get("customerPhone");
    const type = get("cakeType");

    if (!name || !phone || !type) {
        alert("نام، شماره و نوع کیک الزامی است 💗");
        return;
    }

    const typeMap = {
        birthday: "کیک تولد 🎂",
        kids: "کیک کودک 🧸",
        engagement: "کیک نامزدی 💍",
        wedding: "کیک عروسی 👰",
        custom: "کیک سفارشی ✨"
    };

    let msg = `💗 سفارش جدید دل‌کیک\n\n`;
    msg += `👤 ${name}\n📞 ${phone}\n🎂 ${typeMap[type] || type}\n\n`;

    const fields = {
        birthday: [["طعم", "birthdayFlavor"], ["فیلینگ", "birthdayFilling"]],
        kids: [["طعم", "kidFlavor"], ["فیلینگ", "kidFilling"]],
        engagement: [["طعم", "engagementFlavor"], ["فیلینگ", "engagementFilling"]],
        wedding: [["طعم", "weddingFlavor"], ["فیلینگ", "weddingFilling"]],
        custom: [["طعم", "customFlavor"], ["فیلینگ", "customFilling"]]
    };

    (fields[type] || []).forEach(([label, id]) => {
        const el = document.getElementById(id);
        if (el && el.value) {
            msg += `• ${label}: ${el.value}\n`;
        }
    });

    currentMessage = msg;

    openShareModal(msg);
}

/* =========================
   MODAL CONTROL (FIXED)
========================= */
function openShareModal(message) {
    currentMessage = message;

    const modal = document.getElementById("shareModal");
    if (!modal) return;

    modal.classList.remove("hidden");
    vibrate();
}

function closeShareModal() {
    const modal = document.getElementById("shareModal");
    if (modal) modal.classList.add("hidden");
}

/* =========================
   SHARE ACTIONS
========================= */
function openTelegram() {
    window.open(`https://t.me/share/url?text=${encodeURIComponent(currentMessage)}`, "_blank");
}

function openBale() {
    window.open(`https://ble.ir/dellcake_pv?text=${encodeURIComponent(currentMessage)}`, "_blank");
}

function openSMS() {
    window.location.href = `sms:09102768171?body=${encodeURIComponent(currentMessage)}`;
}
