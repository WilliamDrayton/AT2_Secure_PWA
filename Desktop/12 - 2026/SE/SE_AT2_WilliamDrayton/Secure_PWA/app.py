#   Project: Secure Software Architecture - Software Engineering AT2
#   Author: William Drayton
#   Date Created: 05/03/26
#   Description: Python/Flask for the backend of the PWA. 


from flask import Flask, render_template, request, redirect
from flask import jsonify
from flask import session
import secrets
import sqlite3
from flask_bcrypt import Bcrypt

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)

bcrypt = Bcrypt(app) 


def get_db_connection():
    connection = sqlite3.connect("app.db")
    connection.row_factory = sqlite3.Row
    return connection

@app.route("/")
def home():
    return render_template("login.html")

@app.route("/registerUser")
def registerUser():
    return render_template("register.html")

@app.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "GET":
        return render_template("login.html")

    username = request.form["username"]
    password = request.form["password"]

    if not username or not password:
        return render_template("login.html", error="Please fill in all fields")

    connection = get_db_connection()
    user = connection.execute(
        "SELECT * FROM users WHERE username = ?", (username,)
    ).fetchone()
    connection.close()

    if user and bcrypt.check_password_hash(user["password"], password):
        session["user_id"] = user["userID"]
        return redirect("/dashboard")

    return render_template("login.html", error="Invalid username or password")

   
@app.route("/dashboard")
def dashboard():
    if "user_id" not in session:
        return redirect("/login") 
    
    connection = get_db_connection()
    user = connection.execute(
        "SELECT username FROM users WHERE userID = ?",
        (session["user_id"],)
    ).fetchone()
    connection.close()

    return render_template("index.html", username=user["username"]) 

@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")


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
              username TEXT NOT NULL UNIQUE,
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

    if not username or not email or not password:
        return render_template("register.html", error="Please fill in all fields")

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    try:
        connection = get_db_connection()
        connection.execute(
            "INSERT INTO users (email, username, password) VALUES (?, ?, ?)",
            (email, username, hashed_password)
        )
        connection.commit()
        connection.close()
        return redirect("/login")
    except sqlite3.IntegrityError:
        return render_template("register.html", error="Email or username already exists")