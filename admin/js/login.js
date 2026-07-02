import { ADMIN_CONFIG } from "./config.js";
import { signIn, signInWithGoogle, signOut } from "../../js/supabase-auth.js";

// Google Login
document.getElementById("googleLogin").addEventListener("click", async () => {
    try {
        // Passing a relative path; supabase-auth.js helper will prepend the correct base URL
        const redirectUrl = '/admin/admin.html';
        const { error } = await signInWithGoogle(redirectUrl);
        if (error) throw error;
        // Redirect handled by OAuth
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

        const { data, error } = await signIn(email, password);

        if (error) throw error;

        const user = data.user;

        if (user.email === ADMIN_CONFIG.adminEmail) {
            location.replace("admin.html");
        } else {
            alert("دسترسی محدود به مدیر است.");
            await signOut();
            location.replace("login.html?error=unauthorized");
        }
    } catch (error) {
        console.error("Email Login Error:", error);
        alert("خطا در ورود: " + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>ورود به پنل</span> <i class="fa-solid fa-arrow-left"></i>';
    }
});
