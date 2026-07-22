document.addEventListener("DOMContentLoaded", () => {

    const tabButtons = document.querySelectorAll(".tab-btn");

    const tabMap = {
        cake: document.getElementById("cakeTab"),
        cookies: document.getElementById("cookiesTab")
    };

    function switchTab(target) {

        Object.values(tabMap).forEach(tab => {
            if (tab) tab.classList.remove("active");
        });

        if (tabMap[target]) {
            tabMap[target].classList.add("active");
        }
    }

    tabButtons.forEach(btn => {

        btn.addEventListener("click", () => {

            tabButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            switchTab(btn.dataset.tab);

        });

    });

});
