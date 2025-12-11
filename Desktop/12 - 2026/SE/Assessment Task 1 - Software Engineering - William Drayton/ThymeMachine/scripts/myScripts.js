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
			const options = {method, headers: {} };

			if (body) {
				options.headers["Content-Type"] = "application/json";
				options.body = JSON.stringify(body);
			}

			const response = await fetch(url, options);

			if (!response.ok) {
				const text = await response.text();
				throw new Error(`Server Responded With ${response.status}: ${text}`);
			}

			return await response.json();

		} catch (error) {
			console.error("Backend Request Failed:" + error);
			alert ("Something went wrong" + error.message);
		}

	}

	signupForm.addEventListener("submit", (e) => {
		e.preventDefault();

		const username = document.getElementById("username").value;
		const email = document.getElementById("email").value;
		const password = document.getElementById("password").value;
		

		const encodePassword = btoa(password);

		fetch("/api/signup", {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({username, email, password: encodePassword})
		})

		.then(res => res.json())
		.then(data => {
			if (data.success) {
				signupResult.textContent = "Signup Successful. Welcome to Thyme Machine! Redirecting to Login.";
				signupResult.style.color = "green";

				setTimeout(() => {
					window.location.href = "login.html";
				}, 3500);

			}else{
				signupResult.textContent = "Signup Failed. Error: " + data.error;
				signupResult.style.color = "red";
			}
		})

		.catch(err => {
			signupResult.textContent = "Network Error: " + err;
			signupResult.style.color = "red";
		});

	});

	loginForm.addEventListener("submit", (e) => {
		e.preventDefault();

		const username = document.getElementById("username").value;
		const password = document.getElementById("password").value;

		const encodePassword = btoa(password);

		fetch("/api/login", {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({username, password: encodePassword})
		})

		.then(res => res.json())
		.then(data => {
			if (data.success){
				loginResult.textContent = "Login Successful. Welcome!";
				loginResult.style.color = "green";

				setTimeout(() => {
                    window.location.href = "index.html";
                }, 2000);

			}else{
				loginResult.textContent = "Login Failed. Please Try Again";
				loginResult.style.color = "red";
			}
		})

		.catch(err => {
			loginResult.textContent = "Network Error: " + err;
			loginResult.style.color = "red";
		
		});
	



	});


});


