import { supabase, publicSupabase } from "./supabase-client.js";

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("cookieForm");

    if (!form) return;

    form.addEventListener("submit", async (e) => {

        e.preventDefault();
        const submitBtn = e.target.querySelector('.order-submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ثبت...';

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
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'ثبت سفارش شیرینی 🍪';
            return;
        }

        // Save to Database
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const { error: dbError } = await publicSupabase.from('orders').insert([{
                user_id: session?.user?.id || null,
                customer_name: name,
                phone: phone,
                product_name: "شیرینی: " + type,
                address: desc,
                details: { weight, flavors, deliveryDate: date, deliveryTime: time },
                status: 'new'
            }]);

            if (dbError) throw dbError;
            console.log("✅ Cookie order saved successfully.");
        } catch (err) {
            console.error("⚠️ Error saving cookie order to DB:", err);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'ثبت سفارش شیرینی 🍪';
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
