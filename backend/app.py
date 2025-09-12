from flask import Flask, jsonify, request, redirect, session
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure, ConfigurationError
from dotenv import load_dotenv
import os
import requests
from datetime import datetime, timezone
import urllib.parse

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "your-secure-random-string-here")
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

AUTH_URL = 'https://accounts.spotify.com/authorize'
TOKEN_URL = 'https://accounts.spotify.com/api/token'
API_BASE_URL = 'https://api.spotify.com/v1/'

load_dotenv()
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")
MONGO_URI = os.getenv("MONGO_URI")
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000, tls=True)
    db = client['DayBeats']
    user_collection = db['users']
    daily_songs_collection = db['daily_songs']
    client.server_info()
except (ServerSelectionTimeoutError, ConnectionFailure, ConfigurationError):
    raise

def get_user_id_from_token(token):
    response = requests.get(
        'https://api.spotify.com/v1/me',
        headers={'Authorization': f'Bearer {token}'}
    )
    if response.status_code == 200:
        user_data = response.json()
        return user_data['id']
    return None

def store_user(user_data):
    try:
        user_collection.update_one(
            {'_id': user_data['id']},
            {'$set': {
                'email': user_data.get('email'),
                'display_name': user_data.get('display_name'),
                'profile_image': user_data.get('images')[0].get('url') if user_data.get('images') else None,
                'last_updated': datetime.now(timezone.utc)
            }},
            upsert=True
        )
    except Exception:
        raise

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
        return redirect('http://localhost:5173/login?error=' + urllib.parse.quote(request.args['error']))
    
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
        if 'access_token' in token_info:
            access_token = token_info['access_token']
            session['access_token'] = access_token
            session['refresh_token'] = token_info.get('refresh_token')
            session['expires_at'] = datetime.now(timezone.utc).timestamp() + token_info['expires_in']
            user_response = requests.get(
                'https://api.spotify.com/v1/me',
                headers={'Authorization': f'Bearer {access_token}'}
            )
            if user_response.status_code == 200:
                user_data = user_response.json()
                store_user(user_data)
            else:
                return redirect('http://localhost:5173/login?error=failed_to_fetch_user')
            
            return redirect(f'http://localhost:5173/callback?token={access_token}')
        else:
            return redirect('http://localhost:5173/login?error=failed_to_get_token')
    return redirect('http://localhost:5173/login?error=no_code')

@app.route('/verify-token', methods=['POST'])
def verify_token():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        return jsonify({'valid': False}), 401
    response = requests.get(
        'https://api.spotify.com/v1/me',
        headers={'Authorization': f'Bearer {token}'}
    )
    if response.status_code == 200:
        user_data = response.json()
        store_user(user_data)
        return jsonify({'valid': True})
    return jsonify({'valid': False}), 401

@app.route('/api/save-song', methods=['POST'])
def save_song():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        return jsonify({'error': 'Missing token'}), 401
    
    user_id = get_user_id_from_token(token)
    if not user_id:
        return jsonify({'error': 'Invalid token'}), 401
    
    data = request.json
    if not data or not data.get('track_id'):
        return jsonify({'error': 'Missing track data'}), 400
    
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    song_doc = {
        'user_id': user_id,
        'date': today,
        'track_id': data['track_id'],
        'track_name': data['track_name'],
        'artist_name': data['artist_name'],
        'album_image_url': data['album_image_url']
    }
    
    try:
        daily_songs_collection.update_one(
            {'user_id': user_id, 'date': today},
            {'$set': song_doc},
            upsert=True
        )
        return jsonify({'success': True, 'message': 'Song saved for today'})
    except Exception:
        return jsonify({'error': 'Failed to save song'}), 500

@app.route('/api/calendar', methods=['GET'])
def get_calendar():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        return jsonify({'error': 'Missing token'}), 401
    
    user_id = get_user_id_from_token(token)
    if not user_id:
        return jsonify({'error': 'Invalid token'}), 401
    
    try:
        songs = list(daily_songs_collection.find({'user_id': user_id}, {'_id': 0}))
        return jsonify(songs)
    except Exception:
        return jsonify({'error': 'Failed to fetch calendar'}), 500

if __name__ == "__main__":
    app.run(debug=False)