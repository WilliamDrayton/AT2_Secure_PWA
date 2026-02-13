import re
from flask import Flask, render_template, jsonify
import sqlite3




app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/greeting/<name>")
#def greet(name):
   # return render_template("greet.html", user=name)

def greet(name):
    # Remove any unexpected characters
    safe_name = re.sub(r'[^a-zA-Z0-9 ]', '', name) # regex filter
    return render_template("greet.html", user=safe_name)

@app.route("/api/products")
def products():
    return jsonify([
        {"id": 1, "name": "Red Mug", "price": 12.99},
        {"id": 2, "name": "Blue Backpack", "price": 34.50},
        {"id": 3, "name": "Notebook", "price": 5.75}
    ])

def get_db_connection():
    # Creates a connection to the SQLite database
    # row_factory allows us to access rows by name
    connection = sqlite3.connect("app.db")
    connection.row_factory = sqlite3.Row
    return connection

@app.route("/test-db")
def test_db():
    return jsonify({"status": "Database connection successful"})

#@app.route("/setup-db")
#def setup_db():
    #connection = get_db_connection()
    #cursor = connection.cursor()

    #cursor.execute("""
        #CREATE TABLE IF NOT EXISTS user (
             #userID INTEGER PRIMARY KEY AUTOINCREMENT,
              #fName TEXT NOT NULL,
              #lName TEXT NOT NULL,
              #email TEXT NOT NULL, --removed unique for testing
              #userName TEXT NOT NULL,
              #password TEXT NOT NULL
#)
   #""")

    #connection.commit()
    #connection.close()
    #return "Database setup complete"



@app.route("/add-sample")
def add_sample():
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        "INSERT INTO user (fName, lName, userName, email, password) VALUES (?, ?, ?, ?, ?)",
       ("David", "Davison", "Davo", "s_Davison@yahoo.com", "weWillHashThisPassword")
    )

    connection.commit()
    connection.close()
    return "Sample data added"

@app.route("/api/users")
def get_users():
    connection = get_db_connection()
    items = connection.execute(
        "SELECT userName, password FROM user"
    ).fetchall()
    connection.close()

    return jsonify([dict(item) for item in items])