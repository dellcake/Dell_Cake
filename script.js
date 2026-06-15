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

const orderForm = document.getElementById("orderForm");

if (orderForm) {

    orderForm.addEventListener("submit", function (e) {
        e.preventDefault();
        shareOrder();
    });

}

function shareOrder() {

    const name = document.getElementById("customerName").value;
    const phone = document.getElementById("customerPhone").value;
    const type = document.getElementById("cakeType").value;
    const weight = document.getElementById("cakeWeight").value;
    const date = document.getElementById("deliveryDate").value;
    const time = document.getElementById("deliveryTime").value;
    const desc = document.getElementById("orderDescription").value;

    let message =
`💗 سفارش جدید دل‌کیک

👤 نام: ${name}
📞 تلفن: ${phone}
🎂 نوع کیک: ${type}
⚖️ وزن: ${weight} کیلو
📅 تاریخ تحویل: ${date}
⏰ ساعت: ${time}

📝 توضیحات:
${desc}
`;

const baleUrl =
    `https://ble.ir/dellcake_pv?text=${encodeURIComponent(message)}`;

/* =========================
   Mobile = Share
   Desktop = Bale
========================= */

const isMobile =
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

if (isMobile && navigator.share) {

    navigator.share({
        title: "سفارش دل‌کیک",
        text: message
    })
    .catch(err => {
        console.log("Share cancelled:", err);
    });

} else {

    window.open(baleUrl, "_blank");

}
