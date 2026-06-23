const popup = document.getElementById("orderPopup");

window.onload = function () {
  if (!sessionStorage.getItem("popupShown")) {
    if (popup) {
      popup.style.display = "flex";
    }
    sessionStorage.setItem("popupShown", "true");
  }
};

function closePopup() {
  if (popup) {
    popup.style.display = "none";
  }
}
