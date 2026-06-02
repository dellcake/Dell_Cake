const logo = document.getElementById("logoBox");
const intro = document.getElementById("introBox");
const buttons = document.getElementById("buttons");

setTimeout(() => {

logo.classList.remove("hidden");
logo.classList.add("logoAnimate");

}, 300);

setTimeout(() => {

intro.classList.remove("hidden");
intro.classList.add("show");

}, 1400);

setTimeout(() => {

buttons.classList.remove("hidden");
buttons.classList.add("show");

}, 2800);
