document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("cookieForm");

    if (!form) return;

    form.addEventListener("submit", (e) => {

        e.preventDefault();

        const name =
            document.getElementById("cookieName")?.value.trim();

        const phone =
            document.getElementById("cookiePhone")?.value.trim();

        const type =
            document.getElementById("cookieType")?.value;

        const flavors =
            document.getElementById("cookieFlavors")?.value.trim();

        const weight =
            document.getElementById("cookieWeight")?.value.trim();

        const date =
            document.getElementById("cookieDeliveryDate")?.value.trim();

        const time =
            document.getElementById("cookieDeliveryTime")?.value.trim();

        const desc =
            document.getElementById("cookieDesc")?.value.trim();

        if (!name || !phone || !type) {
            alert("لطفاً نام، شماره تماس و نوع شیرینی را تکمیل کنید 💗");
            return;
        }

        let message = "💗 سفارش جدید شیرینی دل‌کیک\n\n";

        message += `👤 نام: ${name}\n`;
        message += `📞 شماره تماس: ${phone}\n`;
        message += `🍪 نوع شیرینی: ${type}\n`;

        if (flavors) {
            message += `🍫 طعم‌ها: ${flavors}\n`;
        }

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
            message += `\n📝 توضیحات: ${desc}\n`;
        }

        openShareModal(message);

    });

});
