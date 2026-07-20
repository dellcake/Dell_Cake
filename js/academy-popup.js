document.addEventListener("DOMContentLoaded", async () => {

    try {

        const response = await fetch("components/academy-popup.html");

        const html = await response.text();

        document.body.insertAdjacentHTML(
            "beforeend",
            html
        );

    } catch (error) {

        console.error(
            "Popup load error:",
            error
        );

    }

});

function openAcademyPopup() {

    const popup =
        document.getElementById("academyPopup");

    if (popup) {
        popup.style.display = "flex";
    }

}

function closeAcademyPopup() {

    const popup =
        document.getElementById("academyPopup");

    if (popup) {
        popup.style.display = "none";
    }

}
