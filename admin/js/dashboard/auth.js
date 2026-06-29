/* =====================================================
        Dell Cake CMS
        Authentication Module
===================================================== */

import {

    auth

} from "../firebase/firebase-auth.js";

import {

    onAuthStateChanged,

    signOut

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

/* =====================================================
        Admin Config
===================================================== */

const ADMIN_EMAIL = "sobhanrahimisrj@gmail.com";

/* =====================================================
        Public
===================================================== */

export function initAuth(){

    return new Promise((resolve,reject)=>{

        onAuthStateChanged(

            auth,

            async(user)=>{

                try{

                    if(!user){

                        redirectLogin();

                        return;

                    }

                    if(user.email !== ADMIN_EMAIL){

                        await signOut(auth);

                        alert("شما مجوز ورود به پنل مدیریت را ندارید.");

                        redirectHome();

                        return;

                    }

                    resolve(user);

                }

                catch(error){

                    reject(error);

                }

            }

        );

    });

}

/* =====================================================
        Logout
===================================================== */

export async function logout(){

    try{

        await signOut(auth);

        redirectLogin();

    }

    catch(error){

        console.error(error);

    }

}

/* =====================================================
        Redirect
===================================================== */

function redirectLogin(){

    window.location.href="../login.html";

}

function redirectHome(){

    window.location.href="../../index.html";

}
