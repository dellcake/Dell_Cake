import { app } from "./firebase-config.js";

import {
    getAuth,
    GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export {
    auth,
    provider
};
