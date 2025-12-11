/*
    Project: ThymeMachine - Software Engineering AT1
    Author: William Drayton
    Date Created: 5/11/25
    Description: Javascript for ThymeMachine (Rewritten)
*/

document.addEventListener("DOMContentLoaded", () => {


    async function backendConnect(url, method = "GET", body = null) {
        try {
            const options = { method, headers: {} };

            if (body) {
                options.headers["Content-Type"] = "application/json";
                options.body = JSON.stringify(body);
            }

            const response = await fetch(url, options);

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Server responded with ${response.status}: ${text}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Connection to database failed");
            throw error;
        }
    }

    const signupForm = document.getElementById("signupForm");
    const signupResult = document.getElementById("signupResult");

    if (signupForm && signupResult) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const username = document.getElementById("username").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            if (!username || !email || !password) {
                signupResult.textContent = "Please fill in all fields.";
                signupResult.style.color = "red";
                return;
            }

            try {
                const data = await backendConnect("/api/signup", "POST", { username, email, password });

                if (data.success) {
                    signupResult.textContent = "Signup successful. Welcome to ThymeMachine! Redirecting to login.";
                    signupResult.style.color = "green";

                    localStorage.setItem("userId", data.userId);

                    setTimeout(() => {
                        window.location.href = "login.html";
                    }, 3500);

                } else {
                    signupResult.textContent = "Signup failed. Try again.";
                    signupResult.style.color = "red";
                }
            } catch (err) {
                signupResult.textContent = "An unexpected error occurred.";
                signupResult.style.color = "red";
            }
        });
    }


    const loginForm = document.getElementById("loginForm");
    const loginResult = document.getElementById("loginResult");

    if (loginForm && loginResult) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const username = document.getElementById("loginUsername").value.trim();
            const password = document.getElementById("loginPassword").value.trim();

            if (!username || !password) {
                loginResult.textContent = "Please fill in all fields.";
                loginResult.style.color = "red";
                return;
            }

            try {
                const data = await backendConnect("/api/login", "POST", { username, password });

                if (data.success) {
                    loginResult.textContent = "Login successful! Redirecting...";
                    loginResult.style.color = "green";

                    localStorage.setItem("userId", data.userId);
                    localStorage.setItem("username", data.username);

                    setTimeout(() => {
                        window.location.href = "../index.html";
                    }, 2000);
                } else {
                    loginResult.textContent = "Invalid username or password.";
                    loginResult.style.color = "red";
                }
            } catch (err) {
                loginResult.textContent = "An unexpected error occurred. Check console.";
                loginResult.style.color = "red";
            }
        });
    }

   
    const userGreeting = document.getElementById("userGreeting");
    const storedUserId = localStorage.getItem("userId");

    if (userGreeting && storedUserId) {
        fetch(`/api/getUserById/${storedUserId}`)
            .then(res => res.json())
            .then(data => {
                userGreeting.textContent = data.username || "Guest";
            })
            .catch(() => userGreeting.textContent = "Guest");
    }


    const recentRecipesList = document.getElementById("recentRecipesList");

    if (recentRecipesList && storedUserId) {
        fetch(`/api/recentRecipes/${storedUserId}`)
            .then(res => res.json())
            .then(data => {
                recentRecipesList.innerHTML = "";

                if (!data || data.length === 0) {
                    const li = document.createElement("li");
                    li.textContent = "No recent recipes.";
                    li.classList.add("text-muted");
                    recentRecipesList.appendChild(li);
                    return;
                }

                data.slice(0, 5).forEach(recipe => {
                    const li = document.createElement("li");
                    li.classList.add("mb-2");

                    const btn = document.createElement("button");
                    btn.textContent = `${recipe.recipeName} — ${new Date(recipe.createdAt).toLocaleDateString()}`;
                    btn.classList.add("btn", "btn-outline-secondary", "w-100", "text-start");
                    btn.addEventListener("click", () => {
                        window.location.href = `pages/userRecipe.html?recipeId=${recipe.recipeId}`;
                    });

                    li.appendChild(btn);
                    recentRecipesList.appendChild(li);
                });
            })
            .catch(err => {
                recentRecipesList.innerHTML = "<li class='text-danger'>Could not load recent recipes.</li>";
            });
    }


    const addRecipeForm = document.getElementById("addRecipe");
    const addIngredientBtn = document.getElementById("addIngredientBtn");
    const ingredientsList = document.getElementById("ingredientsList");
    const saveRecipeBtn = document.getElementById("saveRecipe");

    if (addRecipeForm && addIngredientBtn && ingredientsList && saveRecipeBtn) {

        let ingredientsArray = [];

        addIngredientBtn.addEventListener("click", () => {
            const nameInput = addRecipeForm.querySelector("input[name='ingredientName']");
            const amountInput = addRecipeForm.querySelector("input[name='ingredientAmount']");
            const unitSelect = addRecipeForm.querySelector("select[name='ingredientUnit']");

            const name = nameInput.value.trim();
            const amount = amountInput.value.trim();
            const unit = unitSelect.value;

            if (!name || !amount) {
                alert("Please enter an ingredient name and an amount.");
                return;
            }

            const ingredient = { ingredientName: name, ingredientAmount: amount, ingredientUnit: unit };
            ingredientsArray.push(ingredient);

            const ingredientDiv = document.createElement("div");
            ingredientDiv.classList.add("d-flex", "align-items-center", "mb-1");

            const p = document.createElement("p");
            p.textContent = `${name} - ${amount} ${unit}`;
            p.classList.add("mb-0", "me-2");

            const removeBtn = document.createElement("button");
            removeBtn.type = "button";
            removeBtn.classList.add("btn", "btn-sm", "btn-danger");
            removeBtn.textContent = "Remove";

            removeBtn.addEventListener("click", () => {
                ingredientsList.removeChild(ingredientDiv);
                ingredientsArray = ingredientsArray.filter(i => i !== ingredient);
            });

            ingredientDiv.appendChild(p);
            ingredientDiv.appendChild(removeBtn);
            ingredientsList.appendChild(ingredientDiv);

            nameInput.value = "";
            amountInput.value = "";
        });

        saveRecipeBtn.addEventListener("click", async () => {
            const recipeName = document.getElementById("recipeName").value.trim();
            const recipeCuisine = addRecipeForm.querySelector("select[name='recipeCuisine']").value;
            const cookHours = parseInt(document.getElementById("cookHours").value) || 0;
            const cookMinutes = parseInt(document.getElementById("cookMinutes").value) || 0;
            const notes = document.getElementById("notes").value.trim();
            const instructions = document.getElementById("instructions").value.trim();

            if (!recipeName || !instructions) {
                alert("Please check your recipe contains a name and some instructions.");
                return;
            }

            const userId = localStorage.getItem("userId");
            if (!userId) {
                alert("You must be logged in to add a recipe.");
                return;
            }

            try {
                const response = await fetch("/api/recipes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, recipeName, recipeCuisine, cookHours, cookMinutes, notes, instructions })
                });

                const data = await response.json();

                if (!data.success) {
                    alert("Failed to save recipe: ");
                    return;
                }

                const recipeId = data.recipeId;

                for (const ingredient of ingredientsArray) {
                    await fetch("/api/ingredients", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ recipeId, ...ingredient })
                    });
                }

                alert("Recipe saved successfully!");
                window.location.reload();
            } catch (err) {
                alert("An error occurred while saving the recipe.");
            }
        });
    }

});