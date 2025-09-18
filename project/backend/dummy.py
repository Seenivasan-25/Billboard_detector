from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_cors import CORS, cross_origin
from werkzeug.utils import secure_filename
import jwt
import datetime
from pymongo import MongoClient
import certifi
import os
import sys
import base64
from datetime import datetime  # keep
from datetime import datetime as dt  # keep your alias used in info()/joinDate
from datetime import timezone, timedelta  # ✅ add this
import time  # ✅ add this

import requests
import json
from prediction import check_compliance

# ---------------------- Flask App Setup ----------------------
app = Flask(__name__)
bcrypt = Bcrypt(app)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

app.config["SECRET_KEY"] = "myverysecuresecretkey"

# ---------------------- MongoDB Setup ----------------------
client = MongoClient(
    "mongodb+srv://somu17721:Somu8499@cluster0.dwfbi1r.mongodb.net/?retryWrites=true&w=majority",
    tlsCAFile=certifi.where()
)
db = client["authDB"]
users = db["users"]

print("Databases:", client.list_database_names())

# ---------------------- File Upload Setup ----------------------
BASE_UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(BASE_UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = BASE_UPLOAD_FOLDER

VIDEO_OUTPUT_FOLDER = os.path.join(BASE_UPLOAD_FOLDER, "videos")
os.makedirs(VIDEO_OUTPUT_FOLDER, exist_ok=True)
app.config["VIDEO_OUTPUT_FOLDER"] = VIDEO_OUTPUT_FOLDER

# ---------------------- Import Video/Image Processing ----------------------
sys.path.insert(0, os.path.dirname(__file__))
try:
    from vediotoimage import process_video
except ModuleNotFoundError as e:
    print("ModuleNotFoundError:", e)
    process_video = None

try:
    from hoarding import run_single
except ModuleNotFoundError as e:
    print("ModuleNotFoundError:", e)
    run_single = None

# ---------------------- Helpers ----------------------
def get_address(lat, lon):
    try:
        url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json"
        headers = {"User-Agent": "MyApp"}
        response = requests.get(url, headers=headers, timeout=5)
        data = response.json()
        return data.get("display_name", "Unknown location")
    except Exception as e:
        print("Error reverse geocoding:", e)
        return "Unknown location"

def save_json(payload: dict, folder: str, filename: str) -> str:
    os.makedirs(folder, exist_ok=True)
    json_path = os.path.join(folder, f"{filename}.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=4)
    return json_path

def info(msg: str):
    print(f"[INFO] {dt.now().strftime('%H:%M:%S')} - {msg}")

# ---------------------- Auth Routes ----------------------
@app.route("/api/signup", methods=["POST", "OPTIONS"])
def signup():
    if request.method == "OPTIONS":
        return '', 200

    data = request.get_json()
    print("Signup data:", data)

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"message": "All fields are required"}), 400

    if users.find_one({"email": email}):
        return jsonify({"message": "User already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    users.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password
    })

    return jsonify({"message": "User created successfully"}), 201

@app.route("/api/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return '', 200

    data = request.get_json()
    print("Login data:", data)

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    user = users.find_one({"email": email})
    if not user:
        return jsonify({"message": "User not found"}), 404

    if not bcrypt.check_password_hash(user["password"], password):
        return jsonify({"message": "Invalid credentials"}), 401

    # ✅ Use timezone-aware UTC now and proper timedelta
    token = jwt.encode(
        {
            "id": str(user["_id"]),
            "exp": dt.now(timezone.utc) + timedelta(hours=1)
        },
        app.config["SECRET_KEY"],
        algorithm="HS256"
    )

    return jsonify({
        "message": "Login successful",
        "token": token,
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user["name"],
        "points": user.get("points", 0),
        "level": user.get("level", 1),
        "reports": user.get("reports", 0),
        "joinDate": str(user.get("joinDate", dt.utcnow()))
    }), 200

# ---------------------- Upload Routes ----------------------
@app.route('/upload', methods=['POST'])
def upload():
    """Upload a base64 image and process billboard detection."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data received"}), 400

    image_base64 = data.get('image')
    distance = data.get('distance')
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    filename = data.get('filename', f'image_{int(time.time())}.jpg')

    if not image_base64 or distance is None or latitude is None or longitude is None:
        return jsonify({"error": "Missing required data"}), 400

    try:
        image_data = base64.b64decode(image_base64.split(',')[1])
    except Exception:
        return jsonify({"error": "Invalid base64 image"}), 400

    image_path = os.path.join(BASE_UPLOAD_FOLDER, secure_filename(filename))
    with open(image_path, 'wb') as f:
        f.write(image_data)

    location_address = get_address(latitude, longitude)

    try:
        from the_big_three import process_billboard
        result = process_billboard(
            image_path=image_path,
            distance_to_billboard_m=float(distance),
            location=location_address
        )
    except Exception as e:
        return jsonify({"error": f"Processing failed: {str(e)}"}), 500

    return jsonify(result)

# ---------------------- Hoarding Detection ----------------------
@app.route("/detect-hoarding", methods=["POST"])
def detect_hoarding():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    filename = secure_filename(request.form.get("filename", file.filename or f"upload_{int(time.time())}.jpg"))
    filepath = os.path.join(BASE_UPLOAD_FOLDER, filename)
    file.save(filepath)

    if run_single is None:
        return jsonify({"error": "Hoarding detection module not found"}), 500

    try:
        report = run_single(filepath)

        json_path = os.path.join(BASE_UPLOAD_FOLDER, filename.rsplit('.',1)[0] + ".json")
        txt_path = os.path.join(BASE_UPLOAD_FOLDER, filename.rsplit('.',1)[0] + ".txt")

        with open(json_path, 'w') as f_json, open(txt_path, 'w') as f_txt:
            json.dump(report, f_json, indent=4)
            f_txt.write(json.dumps(report, indent=4))

        return jsonify({
            "status": "success",
            "message": "Hoarding detection completed",
            "filename": filename,
            "saved_path": filepath,
            "detections": {"json_report": json_path, "txt_report": txt_path},
            "report": report
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ---------------------- Video Upload ----------------------
@app.route("/upload-video", methods=["POST"])
def upload_video():
    data = request.get_json()
    print("Received data for video upload:", data)
    if not data or "video" not in data:
        return jsonify({"error": "No video data provided"}), 400

    video_base64 = data["video"]
    filename = secure_filename(data.get("filename", f"video_{int(time.time())}.mp4"))
    video_path = os.path.join(BASE_UPLOAD_FOLDER, filename)
    print("Video will be saved to:", video_path)
    # Decode and save the video
    try:
        video_bytes = base64.b64decode(video_base64.split(",")[1])
        with open(video_path, "wb") as f:
            f.write(video_bytes)
    except Exception as e:
        return jsonify({"error": f"Failed to decode video: {str(e)}"}), 400

    try:
        # Step 1: Call process_video
        video_result = process_video(video_path=video_path, out_dir=VIDEO_OUTPUT_FOLDER, filename=filename)
        cropped_image_path = video_result.get("billboard_image")

        if not cropped_image_path:
            return jsonify({
                "status": "success",
                "video_path": video_path,
                "billboard_image_path": None,
                "billboard_image_base64": None,
                "full_processing": video_result,
                "message": "No billboard detected in the video"
            }), 200

        # Step 2: Convert cropped image to Base64
        with open(cropped_image_path, "rb") as f:
            cropped_b64 = "data:image/jpeg;base64," + base64.b64encode(f.read()).decode("utf-8")

        # Step 3: Call process_billboard directly
        from the_big_three import process_billboard

        final_result = process_billboard(
            image_path=cropped_image_path,
            distance_to_billboard_m=float(data.get("distance", 0)),
            location=get_address(data.get("latitude"), data.get("longitude"))
        )

        # Step 4: Return combined response
        response = {
            "status": "success",
            "video_path": video_path,
            "billboard_image_path": cropped_image_path,
            "billboard_image_base64": cropped_b64,
            "full_processing": final_result,
            "message": "Video processed and billboard fully analyzed"
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"status": "error", "message": f"Video processing failed: {str(e)}"}), 500

from flask_cors import cross_origin

@app.route("/api/check", methods=["POST", "OPTIONS"])
def check():
    if request.method == "OPTIONS":
        return '', 200  # Handle CORS preflight

    data = request.get_json()
    print("Received data:", data)

    if not data:
        return jsonify({
            "success": False,
            "allowed": False,
            "reason": "No data provided"
        }), 400

    result = check_compliance(data)
    return jsonify(result), 200
# ---------------------- Run App ----------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
