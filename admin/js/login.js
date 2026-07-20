import {

auth,
provider

}

from "../../js/firebase-auth.js";

import {

signInWithPopup

}

from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const adminEmail =
"sobhanrahimisrj@gmail.com";

document
.getElementById("googleLogin")
.addEventListener("click", async () => {

try{

const result =
await signInWithPopup(auth,provider);

const user =
result.user;

if(user.email===adminEmail){

location.href="dashboard.html";

}else{

alert("شما مدیر سایت نیستید.");

await auth.signOut();

location.href="../index.html";

}

}

catch(error){

console.log(error);

}

});
