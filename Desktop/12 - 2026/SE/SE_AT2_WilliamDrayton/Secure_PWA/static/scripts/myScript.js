/*
    Project: Secure Software Architecture - Software Engineering AT2
    Author: William Drayton
    Date Created: 05/03/26
    Description: A Javascript file for the Secure PWA. 
*/

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const loginResult = document.getElementById("loginResult");
    const signupForm = document.getElementById("signupForm");
    const signupResult = document.getElementById("signupResult");
    
   
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const res = await fetch("/login", {
                method: "POST",
                body: formData
            });
            if (res.redirected) {
                window.location.href = res.url; 
            } else {
                const text = await res.text();
                loginResult.textContent = "Invalid username or password";
                loginResult.style.color = "red";
            }
        });
    }

    
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault(); 
            const formData = new FormData(signupForm);
            const res = await fetch("/register", {
                method: "POST",
                body: formData
            });
            if (res.redirected) {
                window.location.href = res.url; 
            } else {
                const data = await res.json();
                signupResult.textContent = data.error;
                signupResult.style.color = "red";
            }
        });
    }

       
        const logoutBtn = document.getElementById("logoutAccount");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                window.location.href = "/logout";
            });
        }
    });