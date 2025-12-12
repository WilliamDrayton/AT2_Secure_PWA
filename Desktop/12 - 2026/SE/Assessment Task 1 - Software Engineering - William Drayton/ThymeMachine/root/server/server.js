/*
    Project: ThymeMachine - Software Engineering AT1
    Author: William Drayton
    Date Created: 10/12/25
    Description: node.js server for ThymeMachine 
*/

var express = require("express");
var sqlite3 = require("sqlite3");
const path = require("path");
var app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "../../")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const db = new sqlite3.Database(
    path.join(__dirname, "../../database/myDB.db"), 
    (err) => {
        if (err) console.error("DB connection error:", err.message);
        else console.log("Connected to SQLite database");
    }
);

app.post("/api/signup", (req, res) => {
    const {username, email, password} = req.body;

    const query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

    db.run(query, [username, email, password], function (err) {

        if (err) return res.status(400).json({error : err.message});
        
        res.json({success: true, userId : this.lastID});

    });
});

app.post("/api/login", (req, res) =>{
    const {username, password} = req.body;

    const query = "SELECT userId, username FROM users WHERE username = ? AND password = ?"

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

app.get("/api/getUserById/:id", (req, res) => {
    const userId = req.params.id;  
    const query = "SELECT username, email, password FROM users WHERE userId = ?";

    db.get(query, [userId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.json({});
        res.json({ username: row.username, email: row.email, password: row.password });
    });
});

app.put("/api/user/:userId", (req, res) => {
    
    const userId = req.params.userId;
    const { username, email, password } = req.body;

    const query = `UPDATE users 
                   SET username = ?, email = ?, password = ? 
                   WHERE userId = ?`;

    db.run(query, [username, email, password, userId], function(err) {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true });
    });
});

app.delete("/api/user/:userId", (req, res) => {
    const userId = req.params.userId;

    const query = "DELETE FROM users WHERE userId = ?";
    db.run(query, [userId], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ success: true });
    });
});

app.post("/api/recipes", (req, res) =>{
    const { userId, recipeName, recipeCuisine, cookHours, cookMinutes, notes, instructions } = req.body;

    const query = `
        INSERT INTO recipes (userId, recipeName, recipeCuisine, cookHours, cookMinutes, notes, instructions)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(query, [userId, recipeName, recipeCuisine, cookHours, cookMinutes, notes, instructions], function(err) {
        if(err) return res.status(400).json({ error: err.message });
    
        res.json({ success: true, recipeId: this.lastID });
    });
});

app.get("/api/recentRecipes/:userId", (req, res) => {
    const userId = req.params.userId;

    const query = `
        SELECT recipeId, recipeName, createdAt
        FROM recipes
        WHERE userId = ?
        ORDER BY createdAt DESC
        LIMIT 5
    `;

    db.all(query, [userId], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to load recipes" });
        }

        res.json(rows);
    });
});



app.get("/api/userRecipes/:userId", (req, res) => {
    const userId = req.params.userId;

    const query = `
        SELECT recipeId, recipeName, createdAt
        FROM recipes
        WHERE userId = ?
        ORDER BY createdAt DESC
    `;

    db.all(query, [userId], (err, rows) => {
        if (err) {
            console.error("Failed to load recipes:", err);
            return res.status(500).json({ error: "Failed to load recipes" });
        }

        res.json(rows);
    });
});

app.get("/api/favourites/:userId", (req, res) => {
    const userId = req.params.userId;
    const query = `
        SELECT r.*
        FROM recipes r
        JOIN favourites f ON r.recipeId = f.recipeId
        WHERE f.userId = ?
        ORDER BY r.createdAt DESC
    `;
    db.all(query, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get("/api/currentUser", (req, res) => {
    const userId = req.session ? req.session.userId : null;

        if (!userId) return res.json({});

        const query = "SELECT username FROM users WHERE userId = ?"

        db.get(query, [userId], (err, row) => {
            if (err) return res.status(500).json({error: "Error"});

            if (!row) return res.json({});

            res.json({username : row.username});
        });

});


app.listen(PORT, () => {
    console.log(`ThymeMachine is running on http://localhost:${PORT}`);
});