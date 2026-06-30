import { app } from "./firebase-config.js";

import {

getFirestore

} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const db = getFirestore(app);

export { db };
