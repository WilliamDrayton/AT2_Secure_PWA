/*
	Project: ThymeMachine - Software Engineering AT1
	Author: William Drayton
	Date Created: 9/12/25
	Description: SQlite Schema for ThymeMachine
*/

CREATE TABLE users (
    userId INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recipes (
    recipeId INTEGER PRIMARY KEY AUTOINCREMENT,
    currentUser TEXT NOT NULL,
    recipeName TEXT NOT NULL,
    recipeCuisine TEXT NOT NULL,
    cookHours INTEGER DEFAULT 0,
    cookMinutes INTEGER DEFAULT 0,
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (currentUser) REFERENCES users(username) ON DELETE CASCADE
);

CREATE TABLE ingredients (
    ingredientId INTEGER PRIMARY KEY AUTOINCREMENT,
    recipeId INTEGER NOT NULL,
    ingredientName TEXT NOT NULL,
    ingredientAmount TEXT NOT NULL,
    ingredientUnit TEXT NOT NULL,
    FOREIGN KEY (recipeId) REFERENCES recipes(recipeId) ON DELETE CASCADE
);

CREATE TABLE favourites (
    username TEXT NOT NULL,
    recipeId INTEGER NOT NULL,
    PRIMARY KEY (username, recipeId),
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
    FOREIGN KEY (recipeId) REFERENCES recipes(recipeId) ON DELETE CASCADE
);

