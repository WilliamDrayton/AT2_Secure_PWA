/*
	Project: ThymeMachine - Software Engineering AT1
	Author: William Drayton
	Date Created: 5/11/25
	Description: Javascript for ThymeMachine
*/


	const storedUsername = "WilliamDrayton"; 
    const storedPassword = btoa("987513"); 

    document.getElementById('loginForm').addEventListener('submit', function(event) {
        event.preventDefault(); 

        const usernameInput = document.getElementById('username').value;
        const passwordInput = btoa(document.getElementById('password').value); 

        if(usernameInput === storedUsername && passwordInput === storedPassword) {
            document.getElementById('loginResult').textContent = "Login Successful!";
            document.getElementById('loginResult').classList.remove('text-danger');
            document.getElementById('loginResult').classList.add('text-success');

           
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);

        } else {
            document.getElementById('loginResult').textContent = "Login Failed. Try Again.";
            document.getElementById('loginResult').classList.remove('text-success');
            document.getElementById('loginResult').classList.add('text-danger');
        }
    });