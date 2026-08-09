import { supabase, publicSupabase } from "./supabase-client.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("dummyForm");
    const imageInput = document.getElementById("dummyImage");
    const previewContainer = document.getElementById("dummyImagePreviewContainer");
    const previewImg = document.getElementById("dummyImagePreview");
    const imageNameSpan = document.getElementById("dummyImageName");

    if (!form) return;

    // Interactive sample image upload preview & compression setup
    let base64Image = null;

    if (imageInput) {
        imageInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) {
                previewContainer.style.display = "none";
                previewImg.src = "";
                imageNameSpan.textContent = "";
                base64Image = null;
                return;
            }

            // Real-time text display
            imageNameSpan.textContent = file.name;

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    // Compress image using HTML5 Canvas
                    const canvas = document.createElement("canvas");
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, width, height);

                    // Output compressed JPEG base64 string
                    base64Image = canvas.toDataURL("image/jpeg", 0.7);
                    previewImg.src = base64Image;
                    previewContainer.style.display = "flex";
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('.order-submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ثبت...';

        const name = document.getElementById("dummyName")?.value.trim();
        const phone = document.getElementById("dummyPhone")?.value.trim();
        const type = document.getElementById("dummyType")?.value;
        const dimensions = document.getElementById("dummyDimensions")?.value.trim();
        const colors = document.getElementById("dummyColors")?.value.trim();
        const date = document.getElementById("dummyDeliveryDate")?.value.trim();
        const desc = document.getElementById("dummyDescription")?.value.trim();

        if (!name || !phone || !type || !dimensions || !colors || !date) {
            alert("لطفاً تمامی فیلدهای ستاره‌دار و ضروری را تکمیل کنید 💗");
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> ثبت سفارش ماکت 🌸';
            return;
        }

        const typeMap = {
            birthday: "ماکت کیک تولد 🎂",
            wedding: "ماکت کیک عروسی/نامزدی 💍",
            special: "ماکت کیک خاص/مناسبتی ✨",
            other: "سایر موارد 🌸"
        };

        const dummyProductLabel = typeMap[type] || "ماکت کیک";

        // Save to Supabase DB via public client (no guest auth error fallback)
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const { error: dbError } = await publicSupabase.from('orders').insert([{
                user_id: session?.user?.id || null,
                customer_name: name,
                phone: phone,
                product_name: "ماکت: " + dummyProductLabel,
                address: desc,
                details: {
                    dimensions,
                    colors,
                    deliveryDate: date,
                    sample_image: base64Image // Storing base64 representation directly inside JSONB field
                },
                status: 'new'
            }]);

            if (dbError) throw dbError;
            console.log("✅ Cake Mockup order saved successfully to DB.");
        } catch (err) {
            console.error("⚠️ Error saving mockup order to DB:", err);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> ثبت سفارش ماکت 🌸';
        }

        // Build localized order detail share message
        let message = "💗 سفارش جدید ماکت کیک دل‌کیک\n\n";
        message += `👤 نام: ${name}\n`;
        message += `📞 شماره تماس: ${phone}\n`;
        message += `🌸 نوع ماکت: ${dummyProductLabel}\n`;
        message += `📐 ابعاد: ${dimensions}\n`;
        message += `🎨 رنگ‌بندی: ${colors}\n`;
        message += `📅 تاریخ تحویل: ${date}\n`;

        if (desc) {
            message += `\n📝 توضیحات سفارش:\n`;
            message += `${desc}\n`;
        }

        if (base64Image) {
            message += `\n🖼️ [تصویر نمونه توسط مشتری پیوست شده است]\n`;
        }

        // Trigger existing popup share overlay via global helper
        if (typeof window.openShareModal === "function") {
            window.openShareModal(message);
        } else {
            // Fallback inside same scope
            const shareModal = document.getElementById("shareModal");
            if (shareModal) {
                shareModal.classList.remove("hidden");
                // The existing global handlers inside order-form.js will take care of Telegram/Bale/SMS clicks!
            }
        }
    });
});
