import { db } from "../../js/firebase-db.js";
import { auth } from "../../js/firebase-auth.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.replace('login.html');
        return;
    }

    // Set User Profile UI
    const nameDisplay = document.getElementById('user-display-name');
    const welcomeMsg = document.getElementById('welcome-msg');

    nameDisplay.innerText = user.displayName || user.email.split('@')[0];
    welcomeMsg.innerText = `سلام ${user.displayName || 'دوست من'}! خوش آمدی`;

    // Here you could load user orders/courses from Firestore
});

window.handleLogout = async () => {
    if (confirm('آیا می‌خواهید از پنل خود خارج شوید؟')) {
        await signOut(auth);
        window.location.replace('login.html');
    }
};
