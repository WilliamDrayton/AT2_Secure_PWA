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
            const res = await fetch("/login", {method: "POST", body: formData});
            const data = await res.json();
            if (data.success) {
                loginResult.textContent = "Login Successful!";
                loginResult.style.color = "green";
                setTimeout(() =>window.location.href = "/dashboard", 2500);
            } else {
                
                loginResult.textContent = data.error;
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
            const data = await res.json();
            if (data.success) {
                signupResult.textContent = "Signup Successful! Redirecting to login.";
                signupResult.style.color = "green";
                setTimeout(() =>window.location.href = "/login", 2500);
            } else {
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
    


        if (usernameField && emailField && editBtn) {
            
            async function loadProfile() {
                try {
                    const res = await fetch("/get-profile");
                    const data = await res.json();
                    usernameField.value = data.username;
                    emailField.value = data.email;
                    if (passwordField) passwordField.value = ""; 
                } catch (err) {
                    console.error("Failed to load profile:", err);
                }
            }
            
            loadProfile();
        
            
            if (showPasswordCheckbox && passwordField) {
                showPasswordCheckbox.addEventListener("change", () => {
                    passwordField.type = showPasswordCheckbox.checked ? "text" : "password";
                });
            }
        
            
            editBtn.addEventListener("click", async () => {
                const isEditing = editBtn.textContent === "Edit";
                if (isEditing) {
                    usernameField.removeAttribute("readonly");
                    emailField.removeAttribute("readonly");
                    if (passwordField) passwordField.removeAttribute("readonly");
                    editBtn.textContent = "Save";
                    editBtn.classList.replace("btn-secondary", "btn-success");
                } else {
                    
                    if (!passwordField.value) {
                        alert("Please enter a new password to save changes.");
                        return; 
                    }

                    const payload = {
                        username: usernameField.value,
                        email: emailField.value,
                        password: passwordField.value 
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
                        alert("Something went wrong. Please try again.")
                    }
                }
            });
        }
    });