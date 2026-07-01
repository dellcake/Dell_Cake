import { getStorage } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";
import { app } from "./firebase-config.js";

const storage = getStorage(app);

export { storage };
