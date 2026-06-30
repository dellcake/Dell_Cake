import { app } from "./firebase-config.js";

import {
    getAuth,
    GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export {
    auth,
    provider
};
