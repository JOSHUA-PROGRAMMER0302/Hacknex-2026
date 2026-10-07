# SafeWatch AI — Computer Vision Backend

Autonomous Computer Vision and Behavior-Understanding Backend built with **FastAPI**, **OpenCV**, **Ultralytics YOLOv8**, and **ByteTrack**.

---

## Architecture

```
VIDEO FILE (.mp4, .webm)
   │
   ▼
OpenCV Frame Extraction (cv2.VideoCapture)
   │
   ▼
Ultralytics YOLO (Person & Machine Detection)
   │
   ▼
ByteTrack (Persistent Multi-Object Tracking IDs)
   │
   ▼
Track History & Spatio-Temporal Velocity Engine
   │
   ▼
Behavior Classifier (Walking vs. Stationary Window)
   │
   ▼
Restricted Zone Polygon Intersection Engine
   │
   ▼
Event Engine (Timestamped Anomaly Generation)
   │
   ▼
FastAPI REST & Frame-Synchronized Streaming Endpoints
```

---

## Installation & Setup

### 1. Prerequisites
- Python 3.10+ or 3.11+
- CUDA-enabled GPU (optional for acceleration, CPU fallback supported automatically)

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```
Or directly:
```bash
pip install fastapi uvicorn python-multipart pydantic numpy opencv-python ultralytics torch
```

### 3. Run Backend Server
```bash
python main.py
```
Or with uvicorn directly:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`.
Interactive API documentation is at `http://localhost:8000/docs`.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload` | Uploads video file, returns `video_id` and playback URL |
| `POST` | `/api/analyze` | Executes YOLO + ByteTrack + Behavior pipeline on uploaded video |
| `GET` | `/api/analysis/{id}` | Fetches analysis summary, tracked entities, and metadata |
| `GET` | `/api/analysis/{id}/frame?time=12.4` | Returns exact detections and active tracks at specific video timestamp |
| `GET` | `/api/analysis/{id}/events` | Returns genuine detected safety events with video timestamps |
| `GET` | `/api/analysis/{id}/results` | Returns complete frame-by-frame JSON payload |
