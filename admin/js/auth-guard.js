import { ADMIN_CONFIG } from "./config.js";
import { auth } from "../../js/firebase-auth.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        // Not logged in
        location.replace('login.html');
    } else if (user.email !== ADMIN_CONFIG.adminEmail) {
        // Logged in but not the admin
        console.error("Access denied. Unauthorized user.");
        await signOut(auth);
        location.replace('login.html?error=unauthorized');
    } else {
        // Authorized admin
        console.log("Welcome Admin:", user.email);
    }
});
