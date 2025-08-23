from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests
from datetime import datetime, timedelta


app = Flask(__name__)
CORS(app) 

load_dotenv()
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")

@app.route("/api/spotify-token", methods=["GET"])
def get_spotify_token():
    auth_response = requests.post(
        "https://accounts.spotify.com/api/token",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={"grant_type": "client_credentials"},
        auth=(CLIENT_ID, CLIENT_SECRET)
    )

    if auth_response.status_code != 200:
        return jsonify({"error": "Failed to fetch token"}), 500

    return jsonify(auth_response.json())

if __name__ == "__main__":
    app.run(debug=True)
