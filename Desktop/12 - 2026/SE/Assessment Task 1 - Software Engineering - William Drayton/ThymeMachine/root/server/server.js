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

    const query = "SELECT username FROM users WHERE userId = ?";

    db.get(query, [userId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.json({});

        res.json({ username: row.username });
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