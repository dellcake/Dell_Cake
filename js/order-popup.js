const popup = document.getElementById("orderPopup");
const notice = document.getElementById("topNotice");

window.onload = function () {
  if (!sessionStorage.getItem("popupShown")) {
    popup.style.display = "flex";
    sessionStorage.setItem("popupShown", "true");
  }
};

function closePopup() {
  popup.style.display = "none";
  notice.classList.remove("hidden");
}
