import { resetPassword } from "../../js/supabase-auth.js";

document.getElementById("forgotForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const submitBtn = e.target.querySelector('.submit-btn');

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> در حال ارسال...';

        const { error } = await resetPassword(email);
        if (error) throw error;

        alert("لینک بازیابی رمز عبور به ایمیل شما ارسال شد. لطفا صندوق ورودی (و هرزنامه) خود را چک کنید.");
        location.replace("login.html");
    } catch (error) {
        console.error("Forgot Password Error:", error);
        alert("خطا در ارسال ایمیل بازیابی: " + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>ارسال لینک بازیابی</span> <i class="fa-solid fa-paper-plane"></i>';
    }
});
