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

        const sections = {
            birthday: "birthdayFields",
            kids: "kidsFields",
            engagement: "engagementFields",
            wedding: "weddingFields",
            custom: "customCakeFields"
        };

        cakeType.addEventListener("change", () => {

            Object.values(sections).forEach(id => {
                const section = document.getElementById(id);

                if (section) {
                    section.style.display = "none";
                }
            });

            const selectedSection =
                document.getElementById(
                    sections[cakeType.value]
                );

            if (selectedSection) {
                selectedSection.style.display = "block";
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

            const picker =
                $(deliveryDate).data("datepicker");

            if (picker) {
                picker.show();
            }

        });

    }

});

/* =========================
   ثبت سفارش
========================= */

const orderForm = document.getElementById("orderForm");

if (orderForm) {

    orderForm.addEventListener("submit", function (e) {

        e.preventDefault();
        shareOrder();

    });

}

function getValue(id) {

    const el = document.getElementById(id);
    return el ? el.value.trim() : "";

}

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

    message += "🍰 جزئیات کیک\n";
    message += "──────────────\n";

    const fields = {

        birthday: [
            ["طعم", "birthdayFlavor"],
            ["فیلینگ", "birthdayFilling"],
            ["سبک طراحی", "birthdayDesign"],
            ["رنگ‌ها", "birthdayColors"],
            ["متن روی کیک", "birthdayText"]
        ],

        kids: [
            ["طعم", "kidFlavor"],
            ["فیلینگ", "kidFilling"],
            ["سبک طراحی", "kidDesign"],
            ["شخصیت کارتونی", "kidCharacter"],
            ["رنگ‌ها", "kidColors"]
        ],

        engagement: [
            ["طعم", "engagementFlavor"],
            ["فیلینگ", "engagementFilling"],
            ["سبک طراحی", "engagementDesign"],
            ["تم رنگی", "engagementTheme"],
            ["متن روی کیک", "engagementText"]
        ],

        wedding: [
            ["تعداد طبقات", "weddingFloors"],
            ["طعم", "weddingFlavor"],
            ["فیلینگ", "weddingFilling"],
            ["سبک طراحی", "weddingDesign"],
            ["تم مراسم", "weddingTheme"],
            ["رنگ‌ها", "weddingColors"]
        ],

        custom: [
            ["موضوع کیک", "customTheme"],
            ["طعم", "customFlavor"],
            ["فیلینگ", "customFilling"],
            ["سبک طراحی", "customDesign"],
            ["رنگ‌ها", "customColors"],
            ["متن روی کیک", "customText"]
        ]

    };

    const selectedFields = fields[type] || [];

    selectedFields.forEach(([label, id]) => {

        const value = getValue(id);

        if (value) {
            message += `• ${label}: ${value}\n`;
        }

    });

    message += "\n🚚 اطلاعات تحویل\n";
    message += "──────────────\n";

    if (weight) {
        message += `⚖️ وزن: ${weight} کیلوگرم\n`;
    }

    if (date) {
        message += `📅 تاریخ تحویل: ${date}\n`;
    }

    if (time) {
        message += `⏰ ساعت تحویل: ${time}\n`;
    }

    if (desc) {

        message += "\n📝 توضیحات سفارش\n";
        message += "──────────────\n";
        message += `${desc}\n`;

    }

    const baleUrl =
        `https://ble.ir/dellcake_pv?text=${encodeURIComponent(message)}`;

    const isMobile =
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile && navigator.share) {

        navigator.share({
            title: "سفارش دل‌کیک",
            text: message
        }).catch(err => {
            console.log("Share cancelled:", err);
        });

    } else {

        window.open(baleUrl, "_blank");

    }

        }

let currentMessage = "";

/* باز کردن مودال */
function openShareModal(message) {
    currentMessage = message;

    document.getElementById("shareModal").classList.remove("hidden");
}

/* بستن مودال */
function closeShareModal() {
    document.getElementById("shareModal").classList.add("hidden");
}

/* تلگرام */
function openTelegram() {
    const url = `https://t.me/share/url?text=${encodeURIComponent(currentMessage)}`;
    window.open(url, "_blank");
}

/* بله */
function openBale() {
    const url = `https://ble.ir/dellcake_pv?text=${encodeURIComponent(currentMessage)}`;
    window.open(url, "_blank");
}

/* پیامک */
function openSMS() {
    const phone = "09102768171";
    const url = `sms:${phone}?body=${encodeURIComponent(currentMessage)}`;
    window.location.href = url;
}

/* events */
document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("closeShare")
        ?.addEventListener("click", closeShareModal);

    document.getElementById("shareTelegram")
        ?.addEventListener("click", openTelegram);

    document.getElementById("shareBale")
        ?.addEventListener("click", openBale);

    document.getElementById("shareSMS")
        ?.addEventListener("click", openSMS);

});
