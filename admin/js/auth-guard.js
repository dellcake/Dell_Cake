import { auth } from "./firebase-auth.js";

import {

onAuthStateChanged,
signOut

}

from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const ADMIN_EMAIL =
"sobhanrahimisrj@gmail.com";

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        location.replace("login.html");
        return;

    }

    if (user.email !== ADMIN_EMAIL) {

        await signOut(auth);

        location.replace("login.html");

        return;

    }

});
