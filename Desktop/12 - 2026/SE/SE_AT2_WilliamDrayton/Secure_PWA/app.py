#   Project: Secure Software Architecture - Software Engineering AT2
#   Author: William Drayton
#   Date Created: 05/03/26
#   Description: Python/Flask for the backend of the PWA. 


from flask import Flask, render_template, request, redirect
from flask import jsonify
from flask import session, redirect
from functools import wraps
from datetime import timedelta
import secrets
import re
import sqlite3
from flask_bcrypt import Bcrypt

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)

app.config.update(
    SESSION_COOKIE_HTTPONLY=True,  # JS cannot access cookie
    SESSION_COOKIE_SAMESITE="Lax", # reduces CSRF risk
    SESSION_COOKIE_SECURE=False    # True when using HTTPS
)

app.permanent_session_lifetime = timedelta(minutes=20)

bcrypt = Bcrypt(app) 

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
        session.permanent = True
        session["user_id"] = user["userID"]
        return redirect("/dashboard")

    return render_template("login.html", error="Invalid username or password")

   
@app.route("/dashboard")
@login_required
def dashboard():
    
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

#database setup route - run once to create the database
#@app.route("/create-db")
#def create_db():
    #connection = get_db_connection()
    #cursor = connection.cursor()

    #cursor.execute("""
        #CREATE TABLE IF NOT EXISTS users (
              #userID INTEGER PRIMARY KEY AUTOINCREMENT,
              #email TEXT NOT NULL UNIQUE,
              #username TEXT NOT NULL UNIQUE,
              #password TEXT NOT NULL
          #)
    #""")

    #connection.commit()
    #connection.close()
    #return "Database setup complete"

@app.route("/register", methods=["POST"])
def register():
    username = request.form["username"]
    email = request.form["email"]
    password = request.form["password"]

    if not username or not email or not password:
        return jsonify({"error": "Please fill in all fields"}), 400
    
    if len(username) < 3:
        return jsonify({"error": "Username must be at least 3 characters"}), 400
    
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    
    if len(username) > 16:
        return jsonify({"error": "Username must be no more than 16 characters"}), 400
    
    if len(password) > 20:
        return jsonify({"error": "Password must be no more than 20 characters"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    try:
        connection = get_db_connection()
        username = sanitise_text(username)
        email = sanitise_text(email)
       
        connection.execute(
            "INSERT INTO users (email, username, password) VALUES (?, ?, ?)",
            (email, username, hashed_password)
        )
        connection.commit()
        connection.close()
        return redirect("/login")
    except sqlite3.IntegrityError:
        return jsonify({"error": "Email or username already exists"}), 400