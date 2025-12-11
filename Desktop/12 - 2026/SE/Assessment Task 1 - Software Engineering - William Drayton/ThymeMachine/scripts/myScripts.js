/*
	Project: ThymeMachine - Software Engineering AT1
	Author: William Drayton
	Date Created: 5/11/25
	Description: Javascript for ThymeMachine
*/
document.addEventListener("DOMContentLoaded", () => {

	const signupForm = document.getElementById("signupForm");
	const signupResult = document.getElementById("signupResult");
	const loginForm = document.getElementById("loginForm");
	const loginResult = document.getElementById("loginResult");

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
			console.error("Backend request failed: " + error);
			throw error; 
		}
	}


	if (signupForm) {
		signupForm.addEventListener("submit", async (e) => {
			e.preventDefault();

			const username = document.getElementById("username").value;
			const email = document.getElementById("email").value;
			const password = document.getElementById("password").value;

			try {
				const data = await backendConnect("/api/signup", "POST", { username, email, password });

				if (data && data.success) {
					signupResult.textContent = "Signup Successful. Welcome to ThymeMachine! Redirecting to Login.";
					signupResult.style.color = "green";

					localStorage.setItem("userId", data.userId);

					setTimeout(() => {
						window.location.href = "login.html";
					}, 3500);

				} else {
					signupResult.textContent = "Signup failed. Input required in all fields.";
					signupResult.style.color = "red";
				}
			} catch (err) {
				signupResult.textContent = "An unexpected error occured. Please try again.";
				signupResult.style.color = "red";

				setTimeout(() => {
					window.location.href = "signup.html";
				}, 2000);
			}
		});
	}

	
	if (loginForm) {
		loginForm.addEventListener("submit", async (e) => {
			e.preventDefault();

			const username = document.getElementById("loginUsername").value;
			const password = document.getElementById("loginPassword").value;

			try {
				const data = await backendConnect("/api/login", "POST", { username, password });

				if (data && data.success) {
					loginResult.textContent = "Login successful. Welcome Back!";
					loginResult.style.color = "green";
				
					localStorage.setItem("userId", data.userId);      
					localStorage.setItem("username", data.username);  
				
					setTimeout(() => {
						window.location.href = "../index.html"; 
					}, 2000);

				} else {
					loginResult.textContent = "Login Failed. Please enter the correct username and password.";
					loginResult.style.color = "red";
				}
			} catch (err) {
				loginResult.textContent = "An unexpected error occured. Please try again.";
				loginResult.style.color = "red";

				setTimeout(() => {
					window.location.href = "signup.html";
				}, 2000);

			}
		});
	}

	const userGreeting = document.getElementById("userGreeting");

	const userId = localStorage.getItem("userId");

if (userId && userGreeting) {
    fetch(`/api/getUserById/${userId}`)
        .then(res => res.json())
        .then(data => {
            userGreeting.textContent = data.username || "Guest";
        })
        .catch(() => userGreeting.textContent = "Guest");
}

	const recentRecipesList = document.getElementById("recentRecipesList");

if (recentRecipesList && userId) {
	fetch(`/api/recentRecipes/${userId}`)
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
			console.error(err);
			recentRecipesList.innerHTML = "<li class='text-danger'>Could not load recent recipes.</li>";
		});
}


		const addRecipeForm = document.getElementById("addRecipe");
		const addIngredientBtn = document.getElementById("addIngredientBtn");
		const ingredientsList = document.getElementById("ingredientsList");
		const saveRecipeBtn = document.getElementById("saveRecipe");
	
		
		let ingredientsArray = [];
	
		
		addIngredientBtn.addEventListener("click", () => {
			const nameInput = addRecipeForm.querySelector("input[name='ingredientName']");
			const amountInput = addRecipeForm.querySelector("input[name='ingredientAmount']");
			const unitSelect = addRecipeForm.querySelector("select[name='ingredientUnit']");
		
			const name = nameInput.value.trim();
			const amount = amountInput.value.trim();
			const unit = unitSelect.value;
		
			if (!name || !amount) {
				alert("Please enter both ingredient name and amount.");
				return;
			}
		
			
			const ingredient = {
				ingredientName: name,
				ingredientAmount: amount,
				ingredientUnit: unit
			};
		
			ingredientsArray.push(ingredient);
		
		
			const ingredientDiv = document.createElement("div");
			ingredientDiv.classList.add("d-flex", "align-items-center", "mb-1");
		
	
			const p = document.createElement("p");
			p.textContent = `${name} - ${amount} ${unit}`;
			p.classList.add("mb-0", "me-2");
		
		
			const removeBtn = document.createElement("button");
			removeBtn.textContent = "Remove";
			removeBtn.type = "button";
			removeBtn.classList.add("btn", "btn-sm", "btn-danger");
		
			
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
	
			const currentUser = localStorage.getItem("username");
	
			if (!currentUser) {
				alert("You must be logged in to add a recipe.");
				return;
			}
	
			try {

				const response = await fetch("/api/recipes", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						currentUser,
						recipeName,
						recipeCuisine,
						cookHours,
						cookMinutes,
						notes,
						instructions
					})
				});
	
				const data = await response.json();
	
				if (!data.success) {
					alert("Failed to save recipe: " + data.error);
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
				console.error(err);
				alert("An error occurred while saving the recipe.");
			}
		});
	

});







