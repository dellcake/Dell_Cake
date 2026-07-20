import { app } from "./firebase-config.js";

import {

getFirestore

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const db = getFirestore(app);

export { db };
