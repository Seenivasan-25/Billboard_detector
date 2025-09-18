import sys
import os
import cv2
import json
import numpy as np
from pathlib import Path
from typing import List, Tuple, Dict, Optional
from datetime import datetime

# ======================================================
# -------- Helper: Logging & JSON ----------------------
# ======================================================
def write_json(out_dir: str, video_name: str, payload: dict) -> str:
    os.makedirs(out_dir, exist_ok=True)
    p = os.path.join(out_dir, f"{video_name}_billboard.json")
    with open(p, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
    return p

def info(msg: str):
    print(f"[INFO] {datetime.now().strftime('%H:%M:%S')} - {msg}")

# ======================================================
# -------- Video Reader -------------------------------
# ======================================================
def sample_frames(video_path: str, sample_rate: int = 30) -> List[Tuple[int, np.ndarray]]:
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise FileNotFoundError(f"Could not open video: {video_path}")

    frames = []
    fid = 0
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        if fid % sample_rate == 0:
            frames.append((fid, frame))
        fid += 1
    cap.release()
    return frames

# ======================================================
# -------- Detection: YOLO or Heuristic ---------------
# ======================================================
_YOLO_AVAILABLE = False
try:
    from ultralytics import YOLO
    _YOLO_AVAILABLE = True
except Exception:
    _YOLO_AVAILABLE = False

class YOLOBillboardDetector:
    def __init__(self, weights_path: Optional[str] = None, device: str = ""):
        if not _YOLO_AVAILABLE:
            raise RuntimeError("Ultralytics not installed. Install `ultralytics`.")
        self.model = YOLO(weights_path or "yolov8n.pt")
        self.device = device

    def detect(self, frame_bgr: np.ndarray) -> List[Tuple[int,int,int,int,float]]:
        h, w = frame_bgr.shape[:2]
        res = self.model.predict(frame_bgr, verbose=False, device=self.device)
        boxes = []
        if not res:
            return boxes
        r = res[0]
        for b in r.boxes.data.cpu().numpy().tolist():
            x1, y1, x2, y2, conf, cls = b[:6]
            bw, bh = max(1, x2-x1), max(1, y2-y1)
            area = bw * bh
            aspect = bw / bh
            if area < 0.01 * w * h:
                continue
            if aspect < 1.3:
                continue
            boxes.append((int(x1), int(y1), int(x2), int(y2), float(conf)))
        return boxes

class RectHeuristicDetector:
    def detect(self, frame_bgr: np.ndarray) -> List[Tuple[int,int,int,int,float]]:
        gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (5,5), 0)
        edges = cv2.Canny(gray, 50, 150)
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (9,9))
        closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel, iterations=2)

        contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        h, w = gray.shape[:2]
        out = []
        for c in contours:
            x, y, bw, bh = cv2.boundingRect(c)
            area = bw * bh
            if area < 0.02 * w * h:
                continue
            aspect = bw / max(1, bh)
            if aspect < 1.3:
                continue
            peri = cv2.arcLength(c, True)
            approx = cv2.approxPolyDP(c, 0.02 * peri, True)
            if len(approx) < 4:
                continue
            out.append((x, y, x+bw, y+bh, 0.50))
        out.sort(key=lambda b: (b[2]-b[0])*(b[3]-b[1]), reverse=True)
        return out

def get_detector(weights_path: Optional[str] = None, device: str = ""):
    if _YOLO_AVAILABLE:
        try:
            return YOLOBillboardDetector(weights_path=weights_path, device=device)
        except Exception:
            pass
    return RectHeuristicDetector()

# ======================================================
# -------- Clustering & Saving Billboard ---------------
# ======================================================
def iou(a, b) -> float:
    ax1, ay1, ax2, ay2 = a
    bx1, by1, bx2, by2 = b
    xi1, yi1 = max(ax1, bx1), max(ay1, by1)
    xi2, yi2 = min(ax2, bx2), min(ay2, by2)
    inter = max(0, xi2 - xi1) * max(0, yi2 - yi1)
    ua = (ax2 - ax1) * (ay2 - ay1) + (bx2 - bx1) * (by2 - by1) - inter
    return inter / ua if ua > 0 else 0.0

def cluster_detections(dets: List[Dict], iou_thresh: float = 0.3) -> List[Dict]:
    clusters = []
    for d in dets:
        placed = False
        for c in clusters:
            if iou(c["boxes"][0], d["box"]) > iou_thresh:
                c["boxes"].append(d["box"])
                c["frames"].append(d["frame"])
                c["confs"].append(d["conf"])
                placed = True
                break
        if not placed:
            clusters.append({"boxes":[d["box"]], "frames":[d["frame"]], "confs":[d["conf"]]})
    return clusters

def save_best_billboard(clusters: List[Dict], out_dir: str, video_name: str) -> Optional[str]:
    if not clusters:
        return None
    clusters.sort(key=lambda c: (len(c["boxes"]), np.mean(c["confs"])), reverse=True)
    best = clusters[0]
    boxes = np.array(best["boxes"])
    avg = boxes.mean(axis=0).astype(int)
    x1,y1,x2,y2 = [int(v) for v in avg.tolist()]

    frame = best["frames"][len(best["frames"])//2]  # Get middle frame
    if frame is None or frame.size == 0:
        return None

    h, w = frame.shape[:2]
    x1 = max(0, min(x1, w-1)); x2 = max(0, min(x2, w-1))
    y1 = max(0, min(y1, h-1)); y2 = max(0, min(y2, h-1))
    if x2 <= x1 or y2 <= y1:
        return None

    crop = frame[y1:y2, x1:x2].copy()
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, f"{video_name}_billboard.jpg")
    cv2.imwrite(out_path, crop)
    return out_path

# ======================================================
# -------- Main Pipeline -------------------------------
# ======================================================
from pathlib import Path
from typing import Optional

def process_video(video_path: str, out_dir: str, filename: Optional[str] = None, weights_path: Optional[str] = None, device: str = "") -> Optional[dict]:
    video_path = str(video_path)
    video_name = filename or Path(video_path).stem
    out_dir = str(out_dir)

    info(f"Reading {video_path}")
    frames = sample_frames(video_path, sample_rate=30)

    info("Loading detector")
    detector = get_detector(weights_path=weights_path, device=device)

    info("Detecting...")
    dets = []
    for fid, frame in frames:
        boxes = detector.detect(frame)
        for (x1, y1, x2, y2, conf) in boxes:
            dets.append({"frame_id": fid, "box": (x1, y1, x2, y2), "conf": float(conf), "frame": frame})

    if not dets:
        info("No billboard detected.")
        payload = {
            "video": video_name,
            "detected": False,
            "billboard_image": None,
            "message": "Billboard not detected in this video."
        }
        write_json(out_dir, video_name, payload)
        return payload

    info(f"Detections: {len(dets)} — clustering")
    clusters = cluster_detections(dets, iou_thresh=0.35)

    info("Selecting best billboard and saving crop")
    saved = save_best_billboard(clusters, out_dir, video_name)

    coords = None
    if saved:
        best = max(clusters, key=lambda c: len(c["boxes"]))
        avg = (sum(b[0] for b in best["boxes"]) / len(best["boxes"]),
               sum(b[1] for b in best["boxes"]) / len(best["boxes"]),
               sum(b[2] for b in best["boxes"]) / len(best["boxes"]),
               sum(b[3] for b in best["boxes"]) / len(best["boxes"]))
        coords = [int(v) for v in avg]

    payload = {
        "video": video_name,
        "detected": saved is not None,
        "billboard_image": saved,
        "avg_coords_xyxy": coords,
        "notes": "YOLO used" if "YOLOBillboardDetector" in str(type(detector)) else "Heuristic detector used",
        "message": "Billboard detected successfully" if saved else "Failed to save billboard"
    }

    write_json(out_dir, video_name, payload)
    info(f"Saved billboard: {saved}" if saved else "Failed to save billboard")
    return payload


# ======================================================
# -------- CLI -----------------------------------------
# ======================================================
if __name__ == "__main__":
    if len(sys.argv) < 3 or len(sys.argv) > 5:
        print("Usage: python combined.py <video_path> <out_dir> [weights_path or 'none'] [device]")
        sys.exit(1)

    video_path = sys.argv[1]
    out_dir = sys.argv[2]
    weights = None if (len(sys.argv) < 4 or sys.argv[3].lower() == "none") else sys.argv[3]
    device = "" if len(sys.argv) < 5 else sys.argv[4]

    saved = process_video(video_path, out_dir, weights_path=weights, device=device)
    if saved:
        print(f"Billboard image saved at: {saved}")
    else:
        print("No billboard found.")
