from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from flask_bcrypt import Bcrypt
import base64

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)

# MongoDB connection
client = MongoClient("mongodb+srv://admin:daybeatsadmin@daybeats.yasms.mongodb.net/?retryWrites=true&w=majority&appName=DayBeats")  # Replace with your MongoDB URI
db = client["DayBeats"]  # Your database name
users_collection = db["users"]  # Your users collection

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
        "password": hashed_password,
        "profilePicture": None  # Placeholder for profile picture
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

# Upload profile picture route
@app.route('/upload-profile-picture', methods=['POST'])
def upload_profile_picture():
    data = request.json
    username = data.get('username')  # Assuming the username is passed to identify the user
    image_data = data.get('image')  # Base64-encoded image string

    if not username or not image_data:
        return jsonify({"message": "Username and image data are required"}), 400

    # Update the user's profile picture in the database
    result = users_collection.update_one(
        {"username": username},  # Match user by username
        {"$set": {"profilePicture": image_data}}
    )

    if result.modified_count > 0:
        return jsonify({"message": "Profile picture updated successfully"}), 200
    else:
        return jsonify({"message": "Failed to update profile picture"}), 400

# Fetch user profile route
@app.route('/get-user/<username>', methods=['GET'])
def get_user(username):
    # Find user in the database
    user = users_collection.find_one({"username": username}, {"_id": 0, "password": 0})
    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify(user), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
