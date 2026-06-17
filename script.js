document.addEventListener("DOMContentLoaded", () => {


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

