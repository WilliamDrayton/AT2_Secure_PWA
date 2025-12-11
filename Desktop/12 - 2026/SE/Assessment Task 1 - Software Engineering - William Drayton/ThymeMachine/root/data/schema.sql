/*
	Project: ThymeMachine - Software Engineering AT1
	Author: William Drayton
	Date Created: 9/11/25
	Description: SQlite Schema for ThymeMachine
*/

Users Table:

    userId INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP


Recipes Table:

    recipeId INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    recipeName TEXT NOT NULL,
    recipeCuisine TEXT NOT NULL,
    cookHours INTEGER DEFAULT 0,
    cookMinutes INTEGER DEFAULT 0,
    notes TEXT,
    instructions TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE


Ingredients Table:

    ingredientId INTEGER PRIMARY KEY AUTOINCREMENT,
    recipeId INTEGER NOT NULL,
    ingredientName TEXT NOT NULL,
    ingredientAmount TEXT NOT NULL,
    ingredientUnit TEXT NOT NULL,
    FOREIGN KEY (recipeId) REFERENCES recipes(recipeId) ON DELETE CASCADE


Favourites Table :

    userId INTEGER NOT NULL,
    recipeId INTEGER NOT NULL,
    PRIMARY KEY (userId, recipeId),
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
    FOREIGN KEY (recipeId) REFERENCES recipes(recipeId) ON DELETE CASCADE

