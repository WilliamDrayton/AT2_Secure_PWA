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
    
    // --- LOGIN ---
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const res = await fetch("/login", {
                method: "POST",
                body: formData
            });
            if (res.redirected) {
                window.location.href = res.url; // go to dashboard
            } else {
                const text = await res.text();
                loginResult.textContent = "Invalid username or password";
                loginResult.style.color = "red";
            }
        });
    }

    // --- SIGNUP ---
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault(); 
            const formData = new FormData(signupForm);
            const res = await fetch("/register", {
                method: "POST",
                body: formData
            });
            if (res.redirected) {
                window.location.href = res.url; // go to login page
            } else {
                const text = await res.text();
                signupResult.textContent = text; // e.g., "Email or username already exists"
                signupResult.style.color = "red";
            }
        });
    }

        // --- LOGOUT ---
        const logoutBtn = document.getElementById("logoutAccount");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                window.location.href = "/logout";
            });
        }
    });