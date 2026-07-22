import { supabase } from "./supabase-client.js";

/* =========================
   ثبت سفارش کیک
========================= */

const orderForm = document.getElementById("orderForm");

if (orderForm) {
    orderForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        // Show loading state on submit button
        const submitBtn = orderForm.querySelector(".order-submit-btn");
        const originalBtnHTML = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ثبت سفارش...';

        try {
            await shareOrder();
        } catch (error) {
            console.error("Order submission error:", error);
            alert("خطایی در ثبت سفارش رخ داد. لطفا دوباره تلاش کنید.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;
        }
    });
}

function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
}

async function getCustomerIP() {
    try {
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        return data.ip || "";
    } catch (e) {
        return "";
    }
}

async function uploadImage(fileInputId) {
    const fileInput = document.getElementById(fileInputId);
    const file = fileInput?.files?.[0];
    if (!file) return "";
    try {
        // Try uploading to Supabase Storage if configured
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const { data, error } = await supabase.storage.from('orders').upload(fileName, file);
        if (!error && data) {
            const { data: publicData } = supabase.storage.from('orders').getPublicUrl(fileName);
            return publicData.publicUrl || "";
        }
    } catch (e) {
        console.warn("Supabase Storage upload failed, trying Base64 fallback.", e);
    }

    // Fallback: Base64 data URL
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => resolve("");
        reader.readAsDataURL(file);
    });
}

async function shareOrder() {
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
    const detailsObj = {};

    selectedFields.forEach(([label, id]) => {
        const value = getValue(id);
        if (value) {
            message += `• ${label}: ${value}\n`;
            detailsObj[label] = value;
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

    // Fetch IP and upload sample image
    const [ip, imageUrl] = await Promise.all([
        getCustomerIP(),
        uploadImage("cakePhoto")
    ]);

    // Prepare database order payload
    const orderPayload = {
        customer_name: name,
        customer_phone: phone,
        type: "cake",
        cake_type: type,
        details: detailsObj,
        weight: weight ? parseFloat(weight) : null,
        delivery_date: date,
        delivery_time: time,
        description: desc,
        image_url: imageUrl,
        ip_address: ip,
        status: "new"
    };

    // Save to Supabase (Database Step)
    const { error } = await supabase.from("orders").insert([orderPayload]);
    if (error) {
        console.error("Error saving order to Supabase:", error);
    } else {
        console.log("Order saved to Supabase successfully!");
    }

    // Proceed to Messengers Modal
    openShareModal(message);
}

let currentMessage = "";

/* باز کردن مودال */
export function openShareModal(message) {
    currentMessage = message;
    const modal = document.getElementById("shareModal");
    if (modal) {
        modal.classList.remove("hidden");
    }
}

// Attach openShareModal and supabase to window so other scripts (like cookieForm) can access it
window.openShareModal = openShareModal;
window.supabase = supabase;

/* بستن مودال */
function closeShareModal() {
    const modal = document.getElementById("shareModal");
    if (modal) {
        modal.classList.add("hidden");
    }
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
