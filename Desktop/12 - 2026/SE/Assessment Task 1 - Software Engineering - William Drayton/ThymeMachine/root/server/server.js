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

    const query = "SELECT username FROM users WHERE username = ? AND password = ?"

    db.get(query, [username, password], (err, row) => {
        if (err) return res.status(500).json({error : err.message});

        if (!row)
            return res.status(401).json({
                success: false,
                message: "Invalid Username or Password. Please Try Again."
        });

        res.json({success: true, username: row.username});
    });

});

app.post("/api/recipes", (req, res) =>{
    const {currentUser, recipeName, recipeCuisine, cookHours, cookMinutes, notes} = req.body

    const query = "INSERT INTO recipes (currentUser, recipeName, recipeCuisine, cookHours, cookMinutes, notes) VALUES (?, ?, ?, ?, ?, ?)"

    db.run(query, [currentUser, recipeName, recipeCuisine, cookHours, cookMinutes, notes], 
        function (err) {
            if(err) return res.status(400).json({error : err.message});
            
            res.json({success : true, recipeId : this.lastID});
        }
    );

});

app.get("/api/recipes/:username", (req, res) =>{
    const username = req.params.username;

    const query = "SELECT * FROM recipes WHERE currentUser = ?"

    db.all(query, [username], (err, rows) =>{

        if (err) return res.status(500).json({error : err.message});

        res.json(rows);

    });
});

app.get("/test", (req, res) => {
    db.get("SELECT name FROM sqlite_master WHERE type='table'", (err, row) => {
        if (err) return res.status(500).send("Database error: " + err.message);

        res.send(
            "Server is working! First table in DB: " +
                (row ? row.name : "No tables found")
        );
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});