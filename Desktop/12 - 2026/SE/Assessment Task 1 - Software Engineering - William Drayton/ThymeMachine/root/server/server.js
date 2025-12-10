/*
    Project: ThymeMachine - Software Engineering AT1
    Author: William Drayton
    Date Created: 10/12/25
    Description: Node.js server for ThymeMachine using existing SQLite schema
*/

var express = require("express");
var sqlite3 = require("sqlite3");
var app = express();
const PORT = 9600;

const path = require("path");

app.use(express.static(path.join(__dirname, "../../")));

app.use(express.json())
app.use(express.urlencoded({extended: true}));


const db = new sqlite3.Database(path.join(__dirname, "../../database/myDB.db"), (err) => {
    if (err) console.error("DB connection error:", err.message);
    else console.log("Connected to SQLite database");
});

// Test route to check server and DB connection
app.get("/test", (req, res) => {
    db.get("SELECT name FROM sqlite_master WHERE type='table'", (err, row) => {
        if (err) {
            res.status(500).send("Database error: " + err.message);
        } else {
            res.send("Server is working! First table in DB: " + (row ? row.name : "No tables found"));
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});