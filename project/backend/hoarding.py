# app.py
import os
import sys
import cv2
import json
import base64
import numpy as np
import pytesseract
from pathlib import Path
from datetime import datetime
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename

# =====================
# Preprocessing
# =====================
def load_image(path):
    img = cv2.imread(path)
    if img is None:
        raise FileNotFoundError(f"Could not load image: {path}")
    return img

def enhance_for_analysis(img):
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    l2 = clahe.apply(l)
    lab2 = cv2.merge((l2, a, b))
    enhanced = cv2.cvtColor(lab2, cv2.COLOR_LAB2BGR)
    enhanced = cv2.bilateralFilter(enhanced, d=9, sigmaColor=75, sigmaSpace=75)
    return enhanced

def resize_for_speed(img, max_dim=1200):
    h, w = img.shape[:2]
    scale = 1.0
    if max(h, w) > max_dim:
        scale = max_dim / float(max(h, w))
        img = cv2.resize(img, (int(w*scale), int(h*scale)), interpolation=cv2.INTER_AREA)
    return img, scale

# =====================
# Detection
# =====================
def detect_candidate_board_boxes(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5,5), 0)
    edges = cv2.Canny(blurred, 50, 150)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (15,7))
    closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)
    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    boxes = []
    h_img, w_img = img.shape[:2]
    for c in contours:
        x,y,w,h = cv2.boundingRect(c)
        area = w*h
        if area < (0.01 * w_img * h_img):
            continue
        if w < 60 or h < 40:
            continue
        boxes.append((x,y,w,h,area))
    boxes = sorted(boxes, key=lambda b: b[4], reverse=True)
    return [(x,y,w,h) for (x,y,w,h,_) in boxes]

def crop_box(img, box):
    x,y,w,h = box
    return img[y:y+h, x:x+w].copy()

# =====================
# Metrics
# =====================
def tilt_score(crop):
    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    lines = cv2.HoughLines(edges, 1, np.pi/180, 80)
    if lines is None:
        return 0.0
    angles = []
    for r in lines[:,0]:
        theta = r[1]
        deg = abs((theta * 180.0 / np.pi) % 180)
        if deg > 90: deg = 180 - deg
        angles.append(deg)
    if not angles:
        return 0.0
    spread = float(np.std(angles))
    return min(1.0, spread / 12.0)

def rust_score(crop):
    hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
    lower = np.array([5, 60, 40])
    upper = np.array([30, 255, 255])
    mask = cv2.inRange(hsv, lower, upper)
    ratio = float(cv2.countNonZero(mask)) / (mask.size + 1e-6)
    return min(1.0, ratio * 5.0)

def crack_damage_score(crop):
    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 100, 200)
    density = float(cv2.countNonZero(edges)) / (edges.size + 1e-6)
    return min(1.0, density * 6.0)

def fade_score(crop):
    hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
    sat = float(np.mean(hsv[:,:,1]))
    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    contrast = float(np.std(gray))
    sat_score = 1.0 - min(1.0, sat / 100.0)
    contrast_score = 1.0 - min(1.0, contrast / 60.0)
    return max(sat_score, contrast_score)

# =====================
# OCR
# =====================
def ocr_mean_confidence(crop):
    try:
        gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
        d = pytesseract.image_to_data(gray, output_type=pytesseract.Output.DICT)
        confs = [int(c) for c in d.get('conf', []) if c.strip('-').isdigit()]
        if not confs:
            return 0.0
        return float(sum(confs)) / len(confs)
    except Exception:
        return 0.0

# =====================
# Fuse
# =====================
def fuse_and_score(metrics: dict, permit_ok: bool = True):
    tilt = metrics.get("tilt", 0.0)
    rust = metrics.get("rust", 0.0)
    damage = metrics.get("damage", 0.0)
    fade = metrics.get("fade", 0.0)
    ocr_conf = metrics.get("ocr_conf", 0.0)

    w = {"tilt": 0.35, "rust": 0.25, "damage": 0.25, "fade": 0.10}
    risk = w["tilt"]*tilt + w["rust"]*rust + w["damage"]*damage + w["fade"]*fade

    if ocr_conf > 0:
        ocr_bad = max(0.0, (60.0 - ocr_conf) / 60.0)
        risk = min(1.0, risk + 0.05 * ocr_bad)
    else:
        risk = min(1.0, risk + 0.03)

    if not permit_ok:
        risk = min(1.0, risk + 0.12)

    reasons = []
    if tilt >= 0.5:
        reasons.append(f"Tilt high (score={tilt:.2f})")
    if rust >= 0.4:
        reasons.append(f"Rust suspected (score={rust:.2f})")
    if damage >= 0.4:
        reasons.append(f"Cracks likely (score={damage:.2f})")
    if fade >= 0.5:
        reasons.append(f"Fading (score={fade:.2f})")
    if ocr_conf and ocr_conf < 30:
        reasons.append(f"OCR low confidence ({ocr_conf:.0f})")
    if not permit_ok:
        reasons.append("Permit missing/expired")
    return risk, reasons

# =====================
# Notifier (stub)
# =====================
def send_alert_if_needed(risk_score, payload, webhook_url=None):
    if risk_score >= 0.6:
        print("[ALERT] Would send alert:", payload)
        return True
    return False

# =====================
# Report
# =====================
def build_report(image_path, detected, reasons, risk_score, metrics):
    report = {
        "image": image_path,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "old_hoarding_detected": bool(detected),
        "risk_score": float(risk_score),
        "risk_percent": int(round(risk_score * 100)),
        "reasons": reasons,
        "metrics": metrics
    }
    return report

# =====================
# Run Single
# =====================
def run_single(image_path: str, out_prefix: str = None, coords=None, permit_ok=True, webhook=None):
    p = Path(image_path)
    if out_prefix is None:
        out_prefix = str(p.with_suffix(''))
    img = load_image(image_path)
    img, scale = resize_for_speed(img, max_dim=1200)
    enhanced = enhance_for_analysis(img)

    boxes = detect_candidate_board_boxes(img)
    if not boxes:
        return build_report(image_path, False, ["No billboard-like region found"], 0.0, {})

    box = boxes[0]
    crop = crop_box(enhanced, box)

    t = tilt_score(crop)
    r = rust_score(crop)
    d = crack_damage_score(crop)
    f = fade_score(crop)
    ocr_conf = ocr_mean_confidence(crop)

    metrics = {"tilt": t, "rust": r, "damage": d, "fade": f, "ocr_conf": ocr_conf}
    risk, reasons = fuse_and_score(metrics, permit_ok=permit_ok)
    detected = risk >= 0.25 or len(reasons) > 0

    if ocr_conf and ocr_conf > 0:
        if ocr_conf < 40:
            reasons.insert(0, f"OCR low confidence: {ocr_conf:.0f}%")
    else:
        reasons.insert(0, "OCR not available or no readable text")

    report = build_report(image_path, detected, reasons, risk, metrics)

    if webhook:
        send_alert_if_needed(risk, {"image": image_path, "risk_percent": report["risk_percent"], "reasons": reasons}, webhook)

    return report

# =====================
# Flask API
# =====================
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

@app.route("/detect-hoarding", methods=["POST"])
def detect_hoarding():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    filename = request.form.get("filename", file.filename or "upload.jpg")
    filename = secure_filename(filename)

    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    try:
        pipeline_result = run_single(filepath)
    except Exception as e:
        pipeline_result = {"error": str(e)}

    return jsonify(pipeline_result), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
