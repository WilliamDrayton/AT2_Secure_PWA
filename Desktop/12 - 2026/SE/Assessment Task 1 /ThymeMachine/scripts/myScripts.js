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

    if (currentUser) {
        document.getElementById("userGreeting").textContent = currentUser;
    } else {
        document.getElementById("userGreeting").textContent = "Guest";
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

	if (addIngredientBtn) {

		addIngredientBtn.addEventListener("click", () => {


			const itemInput = document.querySelector("input[name = 'ingredientName']");
			const amountInput = document.querySelector("input[name = 'ingredientAmount']");
			const unitSelect = document.querySelector("select[name = 'ingredientUnit']");

			const item = itemInput ? itemInput.value.trim() : "";
			const amount = amountInput ? amountInput.value.trim() : "";
			const unit = unitSelect ? unitSelect.value.trim(): "";

			if (!item || !amount) {
				alert("Please Enter an Ingredient and an Amount.")
				return;
			}

			ingredients.push({
				id: Date.now() + Math.floor(Math.random() *1000000),
				item: item,
				amount: amount,
				unit: unit,
			});

			itemInput.value = "";
			amountInput.value = "";
			unitSelect.selectedIndex = 0;

			renderIngredients();

		});

	}

		



	function renderIngredients() {
		const listDiv = document.getElementById("ingredientsList");
		if (!listDiv) return;
	
		listDiv.innerHTML = "<h5>Ingredients Added:</h5>"; // reset header
	
		ingredients.forEach((ing, index) => {
			const div = document.createElement("div");
			div.classList.add("d-flex", "align-items-center", "mb-1");
	
			div.textContent = `${ing.amount} ${ing.unit} of ${ing.item}`;
	
			// optional remove button
			const removeBtn = document.createElement("button");
			removeBtn.textContent = "Remove";
			removeBtn.classList.add("btn", "btn-sm", "btn-danger", "ms-2");
			removeBtn.addEventListener("click", () => {
				ingredients.splice(index, 1); // remove ingredient
				renderIngredients(); // re-render
			});
	
			div.appendChild(removeBtn);
			listDiv.appendChild(div);
			
		});
	}

});
	
