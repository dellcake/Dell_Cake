document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("cookieForm");

    if (!form) return;

    form.addEventListener("submit", (e) => {

        e.preventDefault();

        const name = document.getElementById("cookieName").value.trim();
        const phone = document.getElementById("cookiePhone").value.trim();
        const type = document.getElementById("cookieType").value;
        const flavors = document.getElementById("cookieFlavors").value.trim();
        const desc = document.getElementById("cookieDesc").value.trim();

        if (!name || !phone || !type) {
            alert("لطفاً اطلاعات ضروری را کامل کنید 💗");
            return;
        }

        let message = "💗 سفارش جدید شیرینی دل‌کیک\n\n";

        message += `👤 نام: ${name}\n`;
        message += `📞 شماره: ${phone}\n`;
        message += `🍪 نوع: ${type}\n`;

        if (flavors) message += `🍫 طعم‌ها: ${flavors}\n`;
        if (desc) message += `📝 توضیحات: ${desc}\n`;

        const url = `https://ble.ir/dellcake_pv?text=${encodeURIComponent(message)}`;

        window.open(url, "_blank");

    });

});
