#   Project: Secure Software Architecture - Software Engineering AT2
#   Author: William Drayton
#   Date Created: 05/03/26
#   Description: Python/Flask for the backend of the PWA. 

from flask import Flask, render_template, request, redirect, jsonify, session
from functools import wraps
from datetime import timedelta
import re
import os
import sqlite3
import logging
from pathlib import Path
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv

app = Flask(__name__)

app.config.update(
    SESSION_COOKIE_HTTPONLY=True,  # JS cannot access cookie
    SESSION_COOKIE_SAMESITE="Lax", # reduces CSRF risk
    SESSION_COOKIE_SECURE=False    # True when using HTTPS
)

app.permanent_session_lifetime = timedelta(minutes=20)

bcrypt = Bcrypt(app) 

load_dotenv()
app.secret_key = os.getenv("SECRET_KEY")

logging.basicConfig(
    filename="security.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

def login_required(route_function):
    @wraps(route_function)
    def wrapper(*args, **kwargs):
        # Security rationale:
        # deny access unless authenticated
        if "user_id" not in session:
            return redirect("/login")
        return route_function(*args, **kwargs)
    return wrapper

def get_db_connection():
    connection = sqlite3.connect("app.db")
    connection.row_factory = sqlite3.Row
    return connection

def sanitise_text(text):
    # Remove unsafe characters
    # Security rationale: Limits unexpected symbols that may affect rendering
    return re.sub(r"[^a-zA-Z0-9\s]", "", text)

@app.route("/")
def home():
    return render_template("login.html")

@app.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "GET":
        return render_template("login.html")

    username = request.form["username"]
    password = request.form["password"]

    logging.info(f"Login attempt for user: {username}")

    if not username or not password:
        return jsonify({"error": "Please fill in all fields"}), 400

    try:
        connection = get_db_connection()
        user = connection.execute(
            "SELECT * FROM users WHERE username = ?", (username,)
        ).fetchone()
        connection.close()

        if user and bcrypt.check_password_hash(user["password"], password):
            session.permanent = True
            session["user_id"] = user["userID"]
            logging.info(f"Successful login: {username}")
            return jsonify({"success": True})
    
        logging.warning(f"Failed login: {username}")
        return jsonify({"error": "Invalid username or password"}), 401

    except Exception as e:
        logging.error(f"Error during login for {username}: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

   
@app.route("/dashboard")
@login_required
def dashboard():
    
    connection = get_db_connection()
    user = connection.execute(
        "SELECT username FROM users WHERE userID = ?",
        (session["user_id"],)
    ).fetchone()
    connection.close()

    if user is None:
        session.clear()
        return redirect("/login")

    return render_template("index.html", username=user["username"]) 


@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")


#database setup route - run once to create the database
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

@app.route("/register", methods=["GET","POST"])
def register():

    if request.method == "GET":
        return render_template("register.html")
    
    username = request.form["username"]
    email = request.form["email"]
    password = request.form["password"]

    if not username or not email or not password:
        return jsonify({"error": "Please fill in all fields"}), 400
    
    if len(username) < 3:
        return jsonify({"error": "Username must be at least 3 characters"}), 400
    
    if len(username) > 16:
        return jsonify({"error": "Username must be no more than 16 characters"}), 400
    
    if password:
        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), 400
    
        if len(password) > 20:
            return jsonify({"error": "Password must be no more than 20 characters"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    try:
        connection = get_db_connection()
        username = sanitise_text(username)
       
        connection.execute(
            "INSERT INTO users (email, username, password) VALUES (?, ?, ?)",
            (email, username, hashed_password)
        )
        connection.commit()
        connection.close()
        return jsonify({"success": True})
    except sqlite3.IntegrityError:
        return jsonify({"error": "Email or username already exists"}), 400
    

@app.route("/profile")
@login_required
def profile():
    return render_template("myProfile.html")
    
@app.route("/get-profile")
@login_required
def get_profile():
    try:
        connection = get_db_connection()
        user = connection.execute(
            "SELECT username, email FROM users WHERE userID = ?",
            (session["user_id"],)
        ).fetchone()
        connection.close()

        if user is None:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "username": user["username"],
            "email": user["email"]
        })

    except Exception as e:
        logging.error(f"Profile fetch error: {e}")
        return jsonify({"error": "Failed"}), 500
    
@app.route("/update-profile", methods=["POST"])
@login_required
def update_profile():
    data = request.get_json()

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    username = sanitise_text(username)

    if not username or not email:
        return jsonify({"error": "Please enter a new username and email"}), 400
    
    if len(username) < 3:
        return jsonify({"error": "Username must be at least 3 characters"}), 400
    
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    
    if len(username) > 16:
        return jsonify({"error": "Username must be no more than 16 characters"}), 400
    
    if len(password) > 20:
        return jsonify({"error": "Password must be no more than 20 characters"}), 400
    
    

    try:
        connection = get_db_connection()

        if password:
            hashed = bcrypt.generate_password_hash(password).decode("utf-8")
            connection.execute(
                "UPDATE users SET username = ?, email = ?, password = ? WHERE userID = ?",
                (username, email, hashed, session["user_id"])
               
            )
            logging.info(f"Account update for {username}")
        else:
            connection.execute(
                "UPDATE users SET username = ?, email = ? WHERE userID = ?",
                (username, email, session["user_id"])
            )

        connection.commit()
        connection.close()

        return jsonify({"success": True})

    except Exception as e:
        logging.error(f"Update error: {e}")
        return jsonify({"error": "Update failed"}), 500
 

if __name__ == "__main__":    app.run(debug=False)

