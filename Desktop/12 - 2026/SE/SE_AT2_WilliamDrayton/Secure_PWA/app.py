#   Project: Secure Software Architecture - Software Engineering AT2
#   Author: William Drayton
#   Date Created: 05/03/26
#   Description: Python/Flask for the backend of the PWA. 


from flask import Flask, render_template
from flask import jsonify
import sqlite3

app = Flask(__name__)

from flask_bcrypt import Bcrypt
bcrypt = Bcrypt(app) 



def get_db_connection():
    connection = sqlite3.connect("app.db")
    connection.row_factory = sqlite3.Row
    return connection

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/test-db")
def test_db():
    return jsonify({"status": "Database connection successful"})

@app.route("/create-db")
def create_db():
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
              userID INTEGER PRIMARY KEY AUTOINCREMENT,
              email TEXT NOT NULL UNIQUE,
              userName TEXT NOT NULL UNIQUE,
              password TEXT NOT NULL
          )
    """)

    connection.commit()
    connection.close()
    return "Database setup complete"

@app.route("/register", methods=["POST"])
def register():
    username = request.form["username"]
    email = request.form["email"]
    password = request.form["password"]

    # Hash password before storage
    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    connection = get_db_connection()
    connection.execute(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        (username, email, hashed_password)
    )
    connection.commit()
    connection.close()

    return "User registered"