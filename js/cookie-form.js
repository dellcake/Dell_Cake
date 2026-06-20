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

        if (desc) {
            message += `📝 توضیحات: ${desc}\n`;
        }

        // استفاده از مودال فعلی سایت
        openShareModal(message);

    });

});
