import { db } from "../../js/firebase-db.js";
import { auth } from "../../js/firebase-auth.js";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const googleBtn = document.getElementById('google-login');
const emailBtn = document.getElementById('email-auth');

// Protect the login page if already logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Double check it's not the admin accessing customer panel (or let them, but usually they stay in admin)
        window.location.replace('panel.html');
    }
});

async function saveUserToFirestore(user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        await setDoc(userRef, {
            displayName: user.displayName || 'مشتری جدید',
            email: user.email,
            photoURL: user.photoURL || '',
            status: 'active',
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
        });
    } else {
        await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
    }
}

googleBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        await saveUserToFirestore(result.user);
        window.location.replace('panel.html');
    } catch (error) {
        console.error("Google login failed", error);
        alert("خطا در ورود با گوگل: " + error.message);
    }
});

emailBtn.addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) return alert('لطفا ایمیل و رمز عبور را وارد کنید');

    try {
        // Try Login
        const result = await signInWithEmailAndPassword(auth, email, password);
        await saveUserToFirestore(result.user);
        window.location.replace('panel.html');
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            // Try Signup
            try {
                const result = await createUserWithEmailAndPassword(auth, email, password);
                await saveUserToFirestore(result.user);
                window.location.replace('panel.html');
            } catch (signupError) {
                alert("خطا در ایجاد حساب: " + signupError.message);
            }
        } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
            alert('ایمیل یا رمز عبور اشتباه است');
        } else {
            alert("خطا در ورود: " + error.message);
        }
    }
});
