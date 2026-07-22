import { supabase } from "./supabase-client.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("cookieForm");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Show loading state on submit button
        const submitBtn = form.querySelector(".order-submit-btn");
        const originalBtnHTML = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ثبت سفارش...';

        try {
            const name = document.getElementById("cookieName")?.value.trim();
            const phone = document.getElementById("cookiePhone")?.value.trim();
            const type = document.getElementById("cookieType")?.value;
            const flavors = document.getElementById("cookieFlavors")?.value.trim();
            const weight = document.getElementById("cookieWeight")?.value.trim();
            const date = document.getElementById("cookieDeliveryDate")?.value.trim();
            const time = document.getElementById("cookieDeliveryTime")?.value.trim();
            const desc = document.getElementById("cookieDesc")?.value.trim();

            if (!name || !phone || !type) {
                alert("لطفاً نام، شماره تماس و نوع شیرینی را تکمیل کنید 💗");
                return;
            }

            let message = "💗 سفارش جدید شیرینی دل‌کیک\n\n";

            message += `👤 نام: ${name}\n`;
            message += `📞 شماره تماس: ${phone}\n`;
            message += `🍪 نوع شیرینی: ${type}\n`;

            const detailsObj = {
                "نوع شیرینی": type
            };

            if (flavors) {
                message += `🍫 طعم‌ها: ${flavors}\n`;
                detailsObj["طعم‌ها"] = flavors;
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

            // Fetch IP helper
            async function getCustomerIP() {
                try {
                    const res = await fetch("https://api.ipify.org?format=json");
                    const data = await res.json();
                    return data.ip || "";
                } catch (e) {
                    return "";
                }
            }

            // Image Upload helper
            async function uploadImage(fileInputId) {
                const fileInput = document.getElementById(fileInputId);
                const file = fileInput?.files?.[0];
                if (!file) return "";
                try {
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

                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = () => resolve("");
                    reader.readAsDataURL(file);
                });
            }

            // Fetch IP and upload sample image
            const [ip, imageUrl] = await Promise.all([
                getCustomerIP(),
                uploadImage("cookiePhoto")
            ]);

            // Prepare database order payload
            const orderPayload = {
                customer_name: name,
                customer_phone: phone,
                type: "cookie",
                cake_type: null,
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
                console.log("Cookie order saved to Supabase successfully!");
            }

            // Open share modal with message
            if (window.openShareModal) {
                window.openShareModal(message);
            } else {
                alert("سفارش شما با موفقیت ثبت شد 💗");
            }

        } catch (error) {
            console.error("Error submitting cookie order:", error);
            alert("خطایی در ثبت سفارش شیرینی رخ داد.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;
        }
    });
});
