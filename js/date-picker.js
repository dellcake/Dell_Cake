document.addEventListener("DOMContentLoaded", () => {

    function initPersianDatePicker(
        inputId,
        buttonId
    ){

        const input =
            document.getElementById(inputId);

        const button =
            document.getElementById(buttonId);

        if (
            window.jQuery &&
            input &&
            $.fn.persianDatepicker
        ) {

            $(input).persianDatepicker({
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

        if (button && input) {

            button.addEventListener("click", () => {

                input.focus();

                const picker =
                    $(input).data("datepicker");

                if (picker) {
                    picker.show();
                }

            });

        }

    }

    /* تقویم فرم کیک */
    initPersianDatePicker(
        "deliveryDate",
        "calendarBtn"
    );

    /* تقویم فرم شیرینی */
    initPersianDatePicker(
        "cookieDeliveryDate",
        "cookieCalendarBtn"
    );

    /* تقویم فرم ماکت کیک */
    initPersianDatePicker(
        "dummyDeliveryDate",
        "dummyCalendarBtn"
    );

});
