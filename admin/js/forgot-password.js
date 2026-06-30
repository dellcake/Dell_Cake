import { auth } from "../../js/firebase-auth.js";
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

document.getElementById("forgotForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const submitBtn = e.target.querySelector('.submit-btn');

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> در حال ارسال...';

        await sendPasswordResetEmail(auth, email);
        alert("لینک بازیابی رمز عبور به ایمیل شما ارسال شد. لطفا صندوق ورودی (و هرزنامه) خود را چک کنید.");
        location.replace("login.html");
    } catch (error) {
        console.error("Forgot Password Error:", error);
        let message = "خطا در ارسال ایمیل بازیابی";
        if (error.code === 'auth/user-not-found') message = "کاربری با این ایمیل یافت نشد.";
        else if (error.code === 'auth/invalid-email') message = "ایمیل نامعتبر است.";

        alert(message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>ارسال لینک بازیابی</span> <i class="fa-solid fa-paper-plane"></i>';
    }
});
