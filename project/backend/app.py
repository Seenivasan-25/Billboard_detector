from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import sys
import base64
import time
import requests
import json
from datetime import datetime
from prediction import check_compliance 

# ---------------------- Flask App Setup ----------------------
app = Flask(__name__)
CORS(app)

BASE_UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(BASE_UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = BASE_UPLOAD_FOLDER

VIDEO_OUTPUT_FOLDER = os.path.join(BASE_UPLOAD_FOLDER, "videos")
os.makedirs(VIDEO_OUTPUT_FOLDER, exist_ok=True)
app.config["VIDEO_OUTPUT_FOLDER"] = VIDEO_OUTPUT_FOLDER

# ---------------------- Import Video Processing ----------------------
sys.path.insert(0, os.path.dirname(__file__))
try:
    from vediotoimage import process_video
except ModuleNotFoundError as e:
    print("ModuleNotFoundError:", e)
    process_video = None

# ---------------------- Import Image Hoarding Detection ----------------------
try:
    from hoarding import run_single
except ModuleNotFoundError as e:
    print("ModuleNotFoundError:", e)
    run_single = None

# ---------------------- Helper Functions ----------------------
def get_address(lat, lon):
    """Reverse geocode latitude and longitude to a human-readable address."""
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
    print(f"[INFO] {datetime.now().strftime('%H:%M:%S')} - {msg}")

# ---------------------- Routes ----------------------
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
    app.run(host="0.0.0.0", port=5000, debug=False)
