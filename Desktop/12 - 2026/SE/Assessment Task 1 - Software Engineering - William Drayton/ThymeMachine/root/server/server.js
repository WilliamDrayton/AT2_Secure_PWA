/*
    Project: ThymeMachine - Software Engineering AT1
    Author: William Drayton
    Date Created: 10/12/25
    Description: node.js server for ThymeMachine 
*/

//Imports
const express = require("express");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();

const PORT = 3000; // Definition of Port

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const db = new sqlite3.Database( path.join(__dirname, "../../database/myDB.db") ); // Connect to the database


//Signup Route
app.post("/api/signup", (req, res) => {
    const {username, email, password} = req.body;

    const query = " INSERT INTO users (username, email, password) VALUES (?, ?, ?) ";

    db.run(query, [username, email, password], function (err) {

        if (err) return res.status(400).json({error : err.message});
        
        res.json({success: true, userId : this.lastID});

    });
});

//Login Route
app.post("/api/login", (req, res) =>{
    const {username, password} = req.body;

    const query = " SELECT userId, username FROM users WHERE username = ? AND password = ? "

    db.get(query, [username, password], (err, row) => {
        if (err) return res.status(500).json({error : err.message});

        if (!row)
            return res.status(401).json({
                success: false,
                message: "Invalid Username or Password. Please Try Again."
        });

        res.json({success: true, userId: row.userId, username: row.username});
    });

});

//Route to get user setails by their unique id
app.get("/api/getUserById/:id", (req, res) => {
    const userId = req.params.id;  

    const query = " SELECT username, email, password FROM users WHERE userId = ? ";

    db.get(query, [userId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.json({});
        res.json({ username: row.username, email: row.email, password: row.password });
    });

});



//Route to update user details
app.put("/api/user/:userId", (req, res) => {
    
    const userId = req.params.userId;

    const { username, email, password } = req.body;

    const query = " UPDATE users SET username = ?, email = ?, password = ? WHERE userId = ? ";

    db.run(query, [username, email, password, userId], function(err) {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true });
    });

});

//Route to delete account
app.delete("/api/user/:userId", (req, res) => {

    const userId = req.params.userId;

    const query = " DELETE FROM users WHERE userId = ? ";

    db.run(query, [userId], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ success: true });
    });

});

//Route to add a recipe
app.post("/api/recipes", (req, res) =>{

    const { userId, recipeName, recipeCuisine, cookHours, cookMinutes, notes, instructions } = req.body;

    const query = " INSERT INTO recipes (userId, recipeName, recipeCuisine, cookHours, cookMinutes, notes, instructions) VALUES (?, ?, ?, ?, ?, ?, ?) ";
    
    db.run(query, [userId, recipeName, recipeCuisine, cookHours, cookMinutes, notes, instructions], function(err) {
        if(err) return res.status(400).json({ error: err.message });
    
        res.json({ success: true, recipeId: this.lastID });
    });
});

//Route to get 5 recent recipes
app.get("/api/recentRecipes/:userId", (req, res) => {

    const userId = req.params.userId;

    const query = " SELECT recipeId, recipeName, createdAt FROM recipes WHERE userId = ? ORDER BY createdAt DESC LIMIT 5 ";

    db.all(query, [userId], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to load Recent recipes" });
        }

        res.json(rows);
    });

});

//Route to get all recipes
app.get("/api/userRecipes/:userId", (req, res) => {

    const userId = req.params.userId;

    const query = " SELECT recipeId, recipeName, createdAt, recipeCuisine FROM recipes WHERE userId = ? ORDER BY createdAt DESC";

    db.all(query, [userId], (err, rows) => {
        if (err) {
            console.error("Failed to load recipes:", err);
            return res.status(500).json({ error: "Failed to load recipes" });
        }

        res.json(rows);
    });

});

//Route to get recipe by it's id
app.get("/api/recipe/:recipeId", (req, res) => {

    const { recipeId } = req.params;

    const query = " SELECT * FROM recipes WHERE recipeId = ? ";

    db.get(query, [recipeId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row || {});
    });

});

//Route to update a recipe
app.put("/api/recipe/:recipeId", (req, res) => {
    const { recipeId } = req.params;

    const { recipeName, recipeCuisine, cookHours, cookMinutes, instructions, notes } = req.body;

    const query = " UPDATE recipes SET recipeName=?, recipeCuisine=?, cookHours=?, cookMinutes=?, instructions=?, notes=? WHERE recipeId=? ";

    db.run(query, [recipeName, recipeCuisine, cookHours, cookMinutes, instructions, notes, recipeId], err => {
        if (err) return res.status(500).json({ error: "Failed to update your recipe" });
        res.json({ success: true });
    });
});

//Route to delete a recipe
app.delete("/api/recipe/:recipeId", (req, res) => {

    const { recipeId } = req.params;

    const query = "DELETE FROM recipes WHERE recipeId = ?";
    db.run(query, [recipeId], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ success: true });
    });
});

//Route to get ingredients for a recipe 
app.get("/api/ingredients/:recipeId", (req, res) => {
    const { recipeId } = req.params;

    const query = " SELECT ingredientName, ingredientAmount, ingredientUnit FROM ingredients WHERE recipeId = ? ";
    db.all(query, [recipeId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

//route to get users favourite recipe
app.get("/api/favourites/:userId", (req, res) => {

    const { userId } = req.params;

    const query = " SELECT r.recipeId, r.recipeName, r.recipeCuisine, r.createdAt FROM recipes r JOIN favourites f ON r.recipeId = f.recipeId WHERE f.userId = ? ORDER BY r.createdAt DESC ";

    db.all(query, [userId], (err, rows) => {
        if (err) {
            console.error("Error finding favourites:", err);
            return res.status(500).json({ error: "Failed to find favourites" });
        }
        res.json(rows);
    });
});

//Route to set favourite recipe
app.post("/api/favourite/:userId/:recipeId", (req, res) => {

    const { userId, recipeId } = req.params;

    const checkQuery = " SELECT * FROM favourites WHERE userId = ? AND recipeId = ? ";

    db.get(checkQuery, [userId, recipeId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (row) {
           
            const deleteQuery = " DELETE FROM favourites WHERE userId = ? AND recipeId = ? ";

            db.run(deleteQuery, [userId, recipeId], () => res.json({ favourited: false }));

        } else {
            
            const insertQuery = " INSERT INTO favourites (userId, recipeId) VALUES (?, ?) ";

            db.run(insertQuery, [userId, recipeId], () => res.json({ favourited: true }));
        }
    });

});

//Serve files
app.use(express.static(path.join(__dirname, "../../")));

//Start server
app.listen(PORT, () => {
    console.log("ThymeMachine is running on http://localhost:3000");
});


