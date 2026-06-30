import { ADMIN_CONFIG } from "./config.js";
import { auth } from "../../js/firebase-auth.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        location.replace("login.html");
        return;
    }

    if (user.email !== ADMIN_CONFIG.adminEmail) {
        await signOut(auth);
        location.replace("login.html");
        return;
    }
});
