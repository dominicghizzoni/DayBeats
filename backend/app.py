from flask import Flask, jsonify, request, redirect, session
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests
from datetime import datetime, timedelta
import urllib.parse


app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "your-secure-random-string-here")
CORS(app) 

AUTH_URL = 'https://accounts.spotify.com/authorize'
TOKEN_URL = 'https://accounts.spotify.com/api/token'
API_BASE_URL = 'https://api.spotify.com/v1/'

load_dotenv()
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")

@app.route("/api/spotify-token", methods=["GET"])
def get_spotify_token():
    auth_response = requests.post(
        TOKEN_URL,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={"grant_type": "client_credentials"},
        auth=(CLIENT_ID, CLIENT_SECRET)
    )

    if auth_response.status_code != 200:
        return jsonify({"error": "Failed to fetch token"}), 500

    return jsonify(auth_response.json())

@app.route('/splogin')
def splogin():
    scope = 'user-read-email playlist-read-private playlist-modify-public user-top-read user-read-recently-played'


    params = {
        'client_id': CLIENT_ID,
        'response_type': 'code',
        'scope': scope,
        'redirect_uri': REDIRECT_URI,
        'show_dialog': True
    }

    auth_url = f"{AUTH_URL}?{urllib.parse.urlencode(params)}"

    return redirect(auth_url)

@app.route('/callback')
def callback():
    if 'error' in request.args:
        return jsonify({"error": request.args['error']})
    
    if 'code' in request.args:
        req_body = {
            'code': request.args['code'],
            'grant_type': 'authorization_code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET
        }

        response = requests.post(TOKEN_URL, data=req_body)
        token_info = response.json()

        session['access_token'] = token_info['access_token']
        session['refresh_token'] = token_info['refresh_token']
        session['expires_at'] = datetime.now().timestamp() + token_info['expires_in']
        
        return redirect('http://localhost:5173/')

if __name__ == "__main__":
    app.run(debug=True)
