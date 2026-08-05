/* =========================
   ثبت سفارش
========================= */
import { supabase, publicSupabase } from "./supabase-client.js";

const orderForm = document.getElementById("orderForm");

if (orderForm) {

    orderForm.addEventListener("submit", async function (e) {

        e.preventDefault();
        const submitBtn = e.target.querySelector('.order-submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ثبت...';

        try {
            await shareOrder();
        } catch (error) {
            console.error("Order Error:", error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> ثبت سفارش';
        }
    });

}

function getValue(id) {

    const el = document.getElementById(id);
    return el ? el.value.trim() : "";

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

    // Save to Database
    try {
        // Try to get real session if user is logged in
        const { data: { session } } = await supabase.auth.getSession();

        const orderDetails = {
            weight,
            deliveryDate: date,
            deliveryTime: time,
            fields: {}
        };

        const fieldConfigs = {
            birthday: ["birthdayFlavor", "birthdayFilling", "birthdayDesign", "birthdayColors", "birthdayText"],
            kids: ["kidFlavor", "kidFilling", "kidDesign", "kidCharacter", "kidColors"],
            engagement: ["engagementFlavor", "engagementFilling", "engagementDesign", "engagementTheme", "engagementText"],
            wedding: ["weddingFloors", "weddingFlavor", "weddingFilling", "weddingDesign", "weddingTheme", "weddingColors"],
            custom: ["customTheme", "customFlavor", "customFilling", "customDesign", "customColors", "customText"]
        };

        (fieldConfigs[type] || []).forEach(fid => {
            orderDetails.fields[fid] = getValue(fid);
        });

        // Use publicSupabase for insertion to avoid session conflicts for anonymous users
        const { error: dbError } = await publicSupabase.from('orders').insert([{
            user_id: session?.user?.id || null,
            customer_name: name,
            phone: phone,
            product_name: typeMap[type] || type,
            address: desc,
            details: orderDetails,
            status: 'new'
        }]);

        if (dbError) throw dbError;
        console.log("✅ Order saved successfully to database.");
    } catch (err) {
        console.error("⚠️ Error saving order to database:", err);
        // We still proceed with sharing even if DB fails, but we log it
    }

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

        openShareModal(message);

        }

let currentMessage = "";

/* باز کردن مودال */
function openShareModal(message) {
    currentMessage = message;

    document.getElementById("shareModal").classList.remove("hidden");
}

window.openShareModal = openShareModal;

/* بستن مودال */
function closeShareModal() {
    document.getElementById("shareModal").classList.add("hidden");
}

/* تلگرام */
function openTelegram() {
    const url = `https://t.me/Dellmanager_pv?text=${encodeURIComponent(currentMessage)}`;
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

