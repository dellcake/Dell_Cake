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

        openShareModal(message);

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

