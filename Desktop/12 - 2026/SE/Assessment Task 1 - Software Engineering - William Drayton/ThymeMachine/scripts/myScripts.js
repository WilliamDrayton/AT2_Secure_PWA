/*
	Project: ThymeMachine - Software Engineering AT1
	Author: William Drayton
	Date Created: 5/11/25
	Description: Javascript for ThymeMachine
*/
document.addEventListener("DOMContentLoaded", () => {

	const signupForm = document.getElementById("signupForm");
	if (signupForm) signupForm.addEventListener("submit", handleSignup);

	const loginForm = document.getElementById("loginForm");
	if (loginForm) loginForm.addEventListener("submit", handleLogin);

	const currentUser = localStorage.getItem("currentUser");

	const userGreetingEl = document.getElementById("userGreeting");
	if (userGreetingEl) {
		if (currentUser) {
			userGreetingEl.textContent = currentUser;
		} else {
			userGreetingEl.textContent = "Guest";
		}
	}

	function getUsers() {
		return JSON.parse(localStorage.getItem("users")) || {};
	}

	function saveUsers (users) {
		localStorage.setItem("users", JSON.stringify(users));
	}

	function isUserTaken(username) {
		const users = getUsers();
		return !!users[username];
	}

	function createUser(username, email, password) {
		const users = getUsers();
		users[username] = {
			email : email,
			password : btoa(password)
		};
		saveUsers(users);
	}

	function handleSignup(event) {
		event.preventDefault();

		const username = document.getElementById("username").value;
		const email = document.getElementById("emailAddress").value;
		const password = document.getElementById("password").value;

		if (!username || !email || !password) {
			document.getElementById('signupResult').textContent = "Please Fill in All Fields.";
            document.getElementById('signupResult').classList.remove('text-success');
            document.getElementById('signupResult').classList.add('text-danger');
			return;
		}

		if(isUserTaken(username)) {
			document.getElementById('signupResult').textContent = "Username Already Taken. Please Choose Another.";
            document.getElementById('signupResult').classList.remove('text-success');
            document.getElementById('signupResult').classList.add('text-danger');
			
			return;
		}

		createUser(username, email, password);

			document.getElementById('signupResult').textContent = "Signup Succesful, Welcome to ThymeMachine! Redirecting to Login.";
            document.getElementById('signupResult').classList.remove('text-danger');
            document.getElementById('signupResult').classList.add('text-success');

		setTimeout(() => {
			window.location.href = 'login.html';
		}, 3000);
		
	}

	function handleLogin(event) {

		event.preventDefault();
		
		const usernameInput = document.getElementById("username").value;
		const passwordInput = document.getElementById("password").value;

		const users = getUsers();

		if (users[usernameInput] && users[usernameInput].password === btoa(passwordInput)) {

			localStorage.setItem("currentUser", usernameInput);
			document.getElementById('loginResult').textContent = "Login Successful!";
            document.getElementById('loginResult').classList.remove('text-danger');
            document.getElementById('loginResult').classList.add('text-success');

           
            setTimeout(() => {
				window.location.href = '../index.html';
            }, 1000);

        } else {
            document.getElementById('loginResult').textContent = "Login Failed. Try Again.";
            document.getElementById('loginResult').classList.remove('text-success');
            document.getElementById('loginResult').classList.add('text-danger');

        }

	}

	let ingredients = [];

	const addIngredientBtn = document.getElementById("addIngredientBtn");
	const itemInput = document.querySelector("input[name='ingredientName']");
	const amountInput = document.querySelector("input[name='ingredientAmount']");
	const unitSelect = document.querySelector("select[name='ingredientUnit']");

	const addRecipeForm = document.getElementById("addRecipe");
	if (addRecipeForm) {

	
	addRecipeForm.addEventListener("submit", (e) => e.preventDefault());
	
	const addIngredient = () => {
		const item = itemInput.value.trim();
		const amount = amountInput.value.trim();
		const unit = unitSelect.value;

		console.log("Item:", item, "Amount:", amount, "Unit:", unit); 
	
		if (!item || !amount) {
			alert("Please Enter an Ingredient and an Amount.");
			return;
		}
	
		ingredients.push({
			item,
			amount,
			unit,
		});
	
		itemInput.value = "";
		amountInput.value = "";
		unitSelect.selectedIndex = 0;
	
		renderIngredients();
	};
	
	
	addIngredientBtn.addEventListener("click", addIngredient);
	
	
	[itemInput, amountInput].forEach(input => {
		input.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				e.preventDefault(); 
				addIngredient();
			}
		});
	});
			
					

	function renderIngredients() {
		const listDiv = document.getElementById("ingredientsList");
		if (!listDiv) return;
	
		listDiv.innerHTML = "<h5>Ingredients Added:</h5>"; 
	
		ingredients.forEach((ing, index) => {
			const div = document.createElement("div");
			div.classList.add("d-flex", "align-items-center", "mb-1");
	
			div.textContent = `${ing.amount} ${ing.unit} of ${ing.item}`;
	
			
			const removeBtn = document.createElement("button");
			removeBtn.textContent = "Remove";
			removeBtn.classList.add("btn", "btn-sm", "btn-danger", "ms-2");
			removeBtn.addEventListener("click", () => {
				ingredients.splice(index, 1); 
				renderIngredients(); 
			});
	
			div.appendChild(removeBtn);
			listDiv.appendChild(div);
			
		});
	}

	addRecipeForm.addEventListener("submit", (e) => {
    	e.preventDefault(); 
	});

	const saveRecipeBtn = document.getElementById("saveRecipe");

	function getRecipes() {
		return JSON.parse(localStorage.getItem("recipes")) || [];
	}

	function saveRecipes(recipes) {
		localStorage.setItem("recipes", JSON.stringify(recipes));
	}

	saveRecipeBtn.addEventListener("click", () => {

		const recipeName = document.getElementById("recipeName").value.trim();
		const recipeCuisine = document.querySelector("select[name='recipeCuisine']").value;
		const cookHours = parseInt(document.getElementById("cookHours").value) || 0;
		const cookMinutes = parseInt(document.getElementById("cookMinutes").value) || 0;
		const instructions = document.getElementById("instructions").value;
		const notes = document.getElementById("notes").value;

		if (!recipeName) {
			alert ("Please enter a name for your recipe.");
			return;
		}

		if (ingredients.length === 0) {
			alert ("Please add at least 1 ingredient.");
			return;
		}

		const newRecipe = {
            id: Date.now(), 
            name: recipeName,
            cuisine: recipeCuisine,
            cookTime: { hours: cookHours, minutes: cookMinutes },
            ingredients: [...ingredients], 
            instructions: instructions,
            notes: notes
        };

		const allRecipes = getRecipes();
        allRecipes.push(newRecipe);
        saveRecipes(allRecipes);

        alert("Recipe saved successfully!");
        addRecipeForm.reset(); 
        ingredients = []; 
        renderIngredients(); 
	});

	}

	const recentRecipesList = document.getElementById("recentRecipesList");
	if (!recentRecipesList) return;

	const recipes = JSON.parse(localStorage.getItem("recipes")) || [];

	const sortedRecipes = recipes.sort((a,b) => b.id - a.id).slice(0, 5);

	sortedRecipes.forEach(recipe => {
		const li = document.createElement("li");
		li.classList.add("mb-2");

		const link = document.createElement("a");
		link.href = '../pages/userRecipe.html';
		link.textContent = `${recipe.name} - ${new Date(recipe.id).toLocaleDateString()}`;
		link.classList.add("text-decoration-none");

		li.appendChild(link);
		recentRecipesList.appendChild(li);
	});

	const profileForm = document.getElementById("profileForm");

	if (profileForm) {
		const currentUser = localStorage.getItem("currentUser");
		if (!currentUser) {
			alert("User not logged in. Redirecting to login.");

			setTimeout(() => {
				window.location.href = 'login.html';
			}, 3500);

			return;

		} else {
			const users = getUsers();
			const userData = users[currentUser];

			const usernameInput = document.getElementById("username");
			const emailInput = document.getElementById("email");
			const passwordCheck = document.getElementById("passwordCheck");
			const showPassword = document.getElementById("showPassword");
			const editBtn = document.getElementById("editProfile");
			const saveBtn = document.getElementById("saveProfile");
			const deleteBtn = document.getElementById("deleteProfile");

			usernameInput.value = currentUser;
			emailInput.value = userData.email;

			showPassword.addEventListener("change", () => {
				passwordCheck.type = showPassword.checked ? "text" : "password";
			});

			editBtn.addEventListener("click", () => {
				if(btoa(passwordCheck.value) === userData.password) {
					usernameInput.removeAttribute("readonly");
					emailInput.removeAttribute("readonly");
					saveBtn.disabled = false;
				} else {
					alert("Incorrect password. Please try again.");
				}
			});
			

			saveBtn.addEventListener("click", () =>{
				const newUsername = usernameInput.value;
				const newEmail = emailInput.value;

				if (!newUsername || !newEmail) {
					alert("Username and Email can not be empty.")
					return;
				} 

				users[currentUser].email = newEmail;

				if (newUsername !== currentUser) {
					users[newUsername] = {
						...users[currentUser]
					};
					delete users[currentUser];
					localStorage.setItem("currentUser", newUsername);
				}

				saveUsers(users);
				alert("Profile updated successfully!");

				usernameInput.setAttribute("readonly", true);
				emailInput.setAttribute("readonly", true);
				saveBtn.disabled = true;
				passwordCheck.value = "";
			});

			deleteBtn.addEventListener("click", () =>{
				if(confirm("Are you sure you want to delete your account. This can not be undone.")) {
					delete users[currentUser];
					saveUsers(users);
					localStorage.removeItem("currentUser");
					alert("Account deleted. Redirecting to login.");

					setTimeout(() => {
						window.location.href = 'login.html';
					}, 3000);

				}
			})
			
			

		}
	}


});


