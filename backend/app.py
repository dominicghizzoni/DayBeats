from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from flask_bcrypt import Bcrypt

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)

# MongoDB connection
client = MongoClient("mongodb+srv://admin:daybeatsadmin@daybeats.yasms.mongodb.net/?retryWrites=true&w=majority&appName=DayBeats")
db = client["DayBeats"]  # Your database name
users_collection = db["users"]  # Your collection name

# Register route
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    # Check if username or email already exists
    if users_collection.find_one({"username": username}):
        return jsonify({"message": "Username taken"}), 400
    if users_collection.find_one({"email": email}):
        return jsonify({"message": "Email already in use"}), 400

    # Hash the password
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # Store user in the database
    users_collection.insert_one({
        "username": username,
        "email": email,
        "password": hashed_password
    })
    return jsonify({"message": "User registered successfully"}), 201



# Login route
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Find user in the database
    user = users_collection.find_one({"username": username})
    if not user:
        return jsonify({"message": "Invalid username or password"}), 401

    # Check password
    if bcrypt.check_password_hash(user['password'], password):
        return jsonify({"message": "Login successful", "user": username}), 200
    else:
        return jsonify({"message": "Invalid username or password"}), 401


if __name__ == '__main__':
    app.run(debug=True, port=5000)
