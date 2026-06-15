document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       MENU
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
       CAKE TYPE SWITCH
    ========================= */
    const cakeType = document.getElementById("cakeType");

    if (cakeType) {
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

            const target = document.getElementById(sections[cakeType.value]);
            if (target) target.style.display = "block";
        });
    }

    /* =========================
       PERSIAN CALENDAR (SAFE)
    ========================= */
    const deliveryDate = document.getElementById("deliveryDate");
    const calendarBtn = document.getElementById("calendarBtn");

    if (window.jQuery && deliveryDate && $.fn.persianDatepicker) {

        const $input = $(deliveryDate);

        $input.persianDatepicker({
            format: "YYYY/MM/DD",
            autoClose: true,
            initialValue: false
        });

        if (calendarBtn) {
            calendarBtn.addEventListener("click", () => {
                deliveryDate.focus();

                const picker = $input.data("datepicker");

                // بعضی نسخه‌ها show ندارن → فقط focus کافی است
                if (picker && typeof picker.show === "function") {
                    picker.show();
                }
            });
        }
    }

    /* =========================
       ORDER SUBMIT
    ========================= */
    const orderForm = document.getElementById("orderForm");

    if (orderForm) {
        orderForm.addEventListener("submit", (e) => {
            e.preventDefault();
            shareOrder();
        });
    }

});

/* =========================
   GLOBAL STATE
========================= */
let currentMessage = "";

/* =========================
   HELPERS
========================= */
function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
}

function vibrate() {
    if (navigator.vibrate) navigator.vibrate(50);
}

/* =========================
   SHARE SYSTEM
========================= */
function shareOrder() {

    const name = getValue("customerName");
    const phone = getValue("customerPhone");
    const type = getValue("cakeType");

    const weight = getValue("cakeWeight");
    const date = getValue("deliveryDate");
    const time = getValue("deliveryTime");
    const desc = getValue("orderDescription");

    if (!name || !phone || !type) {
        alert("لطفاً نام، شماره تماس و نوع کیک را تکمیل کنید 💗");
        return;
    }

    const typeMap = {
        birthday: "کیک تولد 🎂",
        kids: "کیک کودک 🧸",
        engagement: "کیک نامزدی 💍",
        wedding: "کیک عروسی 👰",
        custom: "کیک سفارشی ✨"
    };

    let message = "💗 سفارش جدید دل‌کیک\n\n";

    message += `👤 نام: ${name}\n`;
    message += `📞 شماره تماس: ${phone}\n`;
    message += `🎂 نوع کیک: ${typeMap[type] || type}\n\n`;

    const fields = {
        birthday: [
            ["طعم", "birthdayFlavor"],
            ["فیلینگ", "birthdayFilling"],
            ["سبک طراحی", "birthdayDesign"],
            ["رنگ‌ها", "birthdayColors"],
            ["متن", "birthdayText"]
        ],
        kids: [
            ["طعم", "kidFlavor"],
            ["فیلینگ", "kidFilling"],
            ["سبک طراحی", "kidDesign"],
            ["شخصیت", "kidCharacter"],
            ["رنگ‌ها", "kidColors"]
        ],
        engagement: [
            ["طعم", "engagementFlavor"],
            ["فیلینگ", "engagementFilling"],
            ["سبک طراحی", "engagementDesign"],
            ["تم", "engagementTheme"],
            ["متن", "engagementText"]
        ],
        wedding: [
            ["طبقات", "weddingFloors"],
            ["طعم", "weddingFlavor"],
            ["فیلینگ", "weddingFilling"],
            ["سبک طراحی", "weddingDesign"],
            ["تم", "weddingTheme"],
            ["رنگ‌ها", "weddingColors"]
        ],
        custom: [
            ["موضوع", "customTheme"],
            ["طعم", "customFlavor"],
            ["فیلینگ", "customFilling"],
            ["سبک", "customDesign"],
            ["رنگ‌ها", "customColors"],
            ["متن", "customText"]
        ]
    };

    message += "🍰 جزئیات:\n──────────────\n";

    (fields[type] || []).forEach(([label, id]) => {
        const val = getValue(id);
        if (val) message += `• ${label}: ${val}\n`;
    });

    message += "\n🚚 تحویل:\n──────────────\n";

    if (weight) message += `⚖️ وزن: ${weight}\n`;
    if (date) message += `📅 تاریخ: ${date}\n`;
    if (time) message += `⏰ ساعت: ${time}\n`;

    if (desc) {
        message += `\n📝 توضیحات:\n${desc}\n`;
    }

    openShareModal(message);
}

/* =========================
   MODAL
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
    window.open(
        `https://t.me/share/url?text=${encodeURIComponent(currentMessage)}`,
        "_blank"
    );
}

function openBale() {
    window.open(
        `https://ble.ir/dellcake_pv?text=${encodeURIComponent(currentMessage)}`,
        "_blank"
    );
}

function openSMS() {
    window.location.href =
        `sms:09102768171?body=${encodeURIComponent(currentMessage)}`;
}

/* =========================
   MODAL EVENTS
========================= */
document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("closeShare")?.addEventListener("click", closeShareModal);

    document.getElementById("shareTelegram")?.addEventListener("click", openTelegram);
    document.getElementById("shareBale")?.addEventListener("click", openBale);
    document.getElementById("shareSMS")?.addEventListener("click", openSMS);

    document.querySelector(".share-backdrop")?.addEventListener("click", closeShareModal);
});
