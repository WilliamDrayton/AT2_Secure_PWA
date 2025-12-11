/*
	Project: ThymeMachine - Software Engineering AT1
	Author: William Drayton
	Date Created: 9/11/25
	Description: Set up for SQlite Schema in ThymeMachine
*/

CREATE TABLE IF NOT EXISTS users (
    userId INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recipes (
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
);

CREATE TABLE IF NOT EXISTS ingredients (
    ingredientId INTEGER PRIMARY KEY AUTOINCREMENT,
    recipeId INTEGER NOT NULL,
    ingredientName TEXT NOT NULL,
    ingredientAmount TEXT NOT NULL,
    ingredientUnit TEXT NOT NULL,
    FOREIGN KEY (recipeId) REFERENCES recipes(recipeId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS favourites (
    userId INTEGER NOT NULL,
    recipeId INTEGER NOT NULL,
    PRIMARY KEY (userId, recipeId),
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
    FOREIGN KEY (recipeId) REFERENCES recipes(recipeId) ON DELETE CASCADE
);

