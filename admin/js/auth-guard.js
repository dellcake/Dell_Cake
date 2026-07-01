import { ADMIN_CONFIG } from "./config.js";
import { onAuthStateChange, signOut } from "../../js/supabase-auth.js";

// Session Management and Protection
onAuthStateChange(async (event, session) => {
    const user = session?.user;
    const currentPage = window.location.pathname.split("/").pop();
    const isLoginPage = currentPage === "login.html" || currentPage === "forgot-password.html" || currentPage === "reset-password.html";

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
            await signOut();
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
