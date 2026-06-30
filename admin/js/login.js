import { ADMIN_CONFIG } from "./config.js";
import { auth, provider } from "../../js/firebase-auth.js";
import { signInWithPopup } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

document.getElementById("googleLogin").addEventListener("click", async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        if (user.email === ADMIN_CONFIG.adminEmail) {
            location.replace("admin.html");
        } else {
            alert("شما مدیر سایت نیستید.");
            await auth.signOut();
            location.href = "../index.html";
        }
    } catch (error) {
        console.error("Login Error:", error);
    }
});
