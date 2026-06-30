import { ADMIN_CONFIG } from "./config.js";
import { auth } from "../../js/firebase-auth.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Session Management and Protection
onAuthStateChanged(auth, async (user) => {
    const currentPage = window.location.pathname.split("/").pop();
    const isLoginPage = currentPage === "login.html" || currentPage === "forgot-password.html";

    if (!user) {
        // Not logged in
        if (!isLoginPage) {
            console.warn("Unauthorized access. Redirecting to login...");
            location.replace("login.html");
        }
    } else {
        // Logged in
        if (user.email !== ADMIN_CONFIG.adminEmail) {
            console.error("Access denied. User is not the admin.");
            await signOut(auth);
            location.replace("login.html?error=unauthorized");
        } else {
            // Authorized admin
            if (isLoginPage) {
                console.log("Admin already logged in. Redirecting to dashboard...");
                location.replace("admin.html");
            }
        }
    }
});
