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
    const usernameField = document.getElementById("profileUsername");
    const emailField = document.getElementById("profileEmail");
    const passwordField = document.getElementById("newPassword");
    const showPasswordCheckbox = document.getElementById("showPassword");
    const editBtn = document.getElementById("editAccount");


    
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

    if (usernameField && emailField) {
        fetch("/get-profile")
            .then(res => res.json())
            .then(data => {
                usernameField.value = data.username;
                emailField.value = data.email;
            })
            
    }    

        const logoutBtn = document.getElementById("logoutAccount");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                window.location.href = "/logout";
            });
        }
    


        if (usernameField && emailField && editBtn) {
            // Load profile details
            async function loadProfile() {
                try {
                    const res = await fetch("/get-profile");
                    const data = await res.json();
                    usernameField.value = data.username;
                    emailField.value = data.email;
                    if (passwordField) passwordField.value = ""; // always empty
                } catch (err) {
                    console.error("Failed to load profile:", err);
                }
            }
            loadProfile();
        
            // Show/hide password
            if (showPasswordCheckbox && passwordField) {
                showPasswordCheckbox.addEventListener("change", () => {
                    passwordField.type = showPasswordCheckbox.checked ? "text" : "password";
                });
            }
        
            // Edit / Save
            editBtn.addEventListener("click", async () => {
                const isEditing = editBtn.textContent === "Edit";
                if (isEditing) {
                    usernameField.removeAttribute("readonly");
                    emailField.removeAttribute("readonly");
                    if (passwordField) passwordField.removeAttribute("readonly");
                    editBtn.textContent = "Save";
                    editBtn.classList.replace("btn-secondary", "btn-success");
                } else {
                    const payload = {
                        username: usernameField.value,
                        email: emailField.value,
                        password: passwordField.value || null // only send if entered
                    };
                    try {
                        const res = await fetch("/update-profile", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload)
                        });
                        const data = await res.json();
                        if (data.success) {
                            usernameField.setAttribute("readonly", true);
                            emailField.setAttribute("readonly", true);
                            if (passwordField) passwordField.setAttribute("readonly", true);
                            passwordField.value = "";
                            editBtn.textContent = "Edit";
                            editBtn.classList.replace("btn-success", "btn-secondary");
                        } else {
                            alert(data.error || "Failed to update profile");
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }
            });
        }
    });