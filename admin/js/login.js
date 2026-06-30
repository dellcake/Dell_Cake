import { ADMIN_CONFIG } from "./config.js";
import { auth, provider } from "../../js/firebase-auth.js";
import {
    signInWithPopup,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Google Login
document.getElementById("googleLogin").addEventListener("click", async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        if (user.email === ADMIN_CONFIG.adminEmail) {
            location.replace("admin.html");
        } else {
            alert("شما مدیر سایت نیستید.");
            await signOut(auth);
            location.replace("login.html?error=unauthorized");
        }
    } catch (error) {
        console.error("Google Login Error:", error);
        alert("خطا در ورود با گوگل: " + error.message);
    }
});

// Email/Password Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const submitBtn = e.target.querySelector('.submit-btn');

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> در حال ورود...';

        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = result.user;

        if (user.email === ADMIN_CONFIG.adminEmail) {
            location.replace("admin.html");
        } else {
            alert("دسترسی محدود به مدیر است.");
            await signOut(auth);
            location.replace("login.html?error=unauthorized");
        }
    } catch (error) {
        console.error("Email Login Error:", error);
        let message = "خطا در ورود";
        if (error.code === 'auth/wrong-password') message = "رمز عبور اشتباه است.";
        else if (error.code === 'auth/user-not-found') message = "کاربری با این ایمیل یافت نشد.";
        else if (error.code === 'auth/invalid-email') message = "ایمیل نامعتبر است.";

        alert(message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>ورود به پنل</span> <i class="fa-solid fa-arrow-left"></i>';
    }
});
