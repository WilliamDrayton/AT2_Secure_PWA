import re
from flask import Flask, render_template
from flask import jsonify

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