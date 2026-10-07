import os
import uuid
import shutil
import json
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from pipeline import VideoAnalysisPipeline

app = FastAPI(
    title="SafeWatch AI — Autonomous Computer Vision Platform",
    version="2.4.0",
    description="Real-time frame extraction, YOLO/OpenCV object detection, ByteTrack tracking, movement classification, and event engine."
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
RESULTS_DIR = os.path.join(os.path.dirname(__file__), "results")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

# Mount uploads directory for static video playback
app.mount("/videos", StaticFiles(directory=UPLOAD_DIR), name="videos")

# In-memory storage for active jobs and results
ANALYSIS_STORE: Dict[str, Dict[str, Any]] = {}
ANALYSIS_JOBS: Dict[str, Dict[str, Any]] = {}

@app.get("/")
@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "SafeWatch AI CV Backend",
        "version": "2.4.0",
        "features": [
            "OpenCV Video Processing",
            "ByteTrack Multi-Object Tracking",
            "Spatial-Temporal Movement Engine",
            "Ray-Casting Restricted Zone Detection",
            "Biomechanic Fall Heuristic"
        ],
        "endpoints": [
            "POST /api/videos",
            "POST /api/videos/{id}/analyze",
            "GET /api/videos/{id}/status",
            "GET /api/videos/{id}/results",
            "GET /api/analysis/{id}/frame"
        ]
    }

# ========================================================
# PHASE 1 — REAL VIDEO PROCESSING
# ========================================================
@app.post("/api/videos")
async def upload_video(file: UploadFile = File(...)):
    """
    Accepts video upload, saves video, creates analysis ID, extracts
    width, height, FPS, frame count, and duration.
    """
    file_id = f"job_{uuid.uuid4().hex[:8]}"
    ext = os.path.splitext(file.filename)[1] or ".mp4"
    saved_filename = f"{file_id}{ext}"
    saved_path = os.path.join(UPLOAD_DIR, saved_filename)

    with open(saved_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    pipeline = VideoAnalysisPipeline()
    try:
        meta = pipeline.extract_metadata(saved_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read video file: {str(e)}")

    ANALYSIS_JOBS[file_id] = {
        "analysis_id": file_id,
        "filename": file.filename,
        "saved_path": saved_path,
        "video_url": f"http://127.0.0.1:8000/videos/{saved_filename}",
        "status": "uploaded",
        "metadata": meta,
        "frames_processed": 0,
        "total_frames": meta["frame_count"],
        "percentage": 0
    }

    return {
        "analysis_id": file_id,
        "fps": meta["fps"],
        "frame_count": meta["frame_count"],
        "duration": meta["duration"],
        "width": meta["width"],
        "height": meta["height"],
        "video_url": f"http://127.0.0.1:8000/videos/{saved_filename}"
    }

# ========================================================
# PHASE 2 & 3 & 6 & 7 & 8: COMPUTER VISION INFERENCE
# ========================================================
def run_pipeline_task(
    analysis_id: str,
    video_path: str,
    original_name: str,
    conf_thresh: float,
    stat_thresh: float,
    polygon: Optional[List[List[float]]]
):
    def on_progress(pct: int, current_ts: float, processed_cnt: int, total_cnt: int):
        if analysis_id in ANALYSIS_JOBS:
            ANALYSIS_JOBS[analysis_id].update({
                "status": "processing",
                "percentage": pct,
                "current_timestamp": current_ts,
                "frames_processed": processed_cnt,
                "total_frames": total_cnt
            })

    try:
        ANALYSIS_JOBS[analysis_id]["status"] = "processing"
        pipeline = VideoAnalysisPipeline(
            person_conf_threshold=conf_thresh,
            stationary_time_threshold=stat_thresh,
            restricted_polygon=polygon
        )
        results = pipeline.process_video(video_path, progress_callback=on_progress)
        results["analysis_id"] = analysis_id
        results["video_name"] = original_name
        results["video_url"] = f"http://127.0.0.1:8000/videos/{os.path.basename(video_path)}"

        ANALYSIS_STORE[analysis_id] = results
        ANALYSIS_JOBS[analysis_id].update({
            "status": "completed",
            "percentage": 100,
            "results": results
        })

        # Save results to disk
        out_file = os.path.join(RESULTS_DIR, f"{analysis_id}.json")
        with open(out_file, "w") as f:
            json.dump(results, f, indent=2)

    except Exception as e:
        print(f"[SafeWatch CV Error] Pipeline failure on {analysis_id}: {e}")
        ANALYSIS_JOBS[analysis_id].update({
            "status": "failed",
            "error": str(e)
        })

@app.post("/api/videos/{analysis_id}/analyze")
@app.post("/api/analyze")
async def start_analysis(
    analysis_id: Optional[str] = None,
    file: Optional[UploadFile] = File(None),
    video_id: Optional[str] = Form(None),
    confidence_threshold: float = Form(0.35),
    stationary_threshold: float = Form(3.0),
    restricted_polygon: Optional[str] = Form(None),
    background_tasks: BackgroundTasks = None
):
    vid_id = analysis_id or video_id

    # Parse polygon if provided as JSON string
    poly = None
    if restricted_polygon:
        try:
            poly = json.loads(restricted_polygon)
        except Exception:
            poly = None

    if file:
        # Save file directly and analyze
        vid_id = f"job_{uuid.uuid4().hex[:8]}"
        ext = os.path.splitext(file.filename)[1] or ".mp4"
        saved_filename = f"{vid_id}{ext}"
        saved_path = os.path.join(UPLOAD_DIR, saved_filename)
        with open(saved_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        pipeline = VideoAnalysisPipeline()
        meta = pipeline.extract_metadata(saved_path)
        ANALYSIS_JOBS[vid_id] = {
            "analysis_id": vid_id,
            "filename": file.filename,
            "saved_path": saved_path,
            "video_url": f"http://127.0.0.1:8000/videos/{saved_filename}",
            "status": "processing",
            "metadata": meta,
            "frames_processed": 0,
            "total_frames": meta["frame_count"],
            "percentage": 0
        }
        target_path = saved_path
        orig_name = file.filename
    elif vid_id and vid_id in ANALYSIS_JOBS:
        target_path = ANALYSIS_JOBS[vid_id]["saved_path"]
        orig_name = ANALYSIS_JOBS[vid_id]["filename"]
    elif vid_id:
        # Check files on disk
        target_path = None
        orig_name = "video.mp4"
        for fname in os.listdir(UPLOAD_DIR):
            if fname.startswith(vid_id):
                target_path = os.path.join(UPLOAD_DIR, fname)
                orig_name = fname
                break
        if not target_path:
            raise HTTPException(status_code=404, detail="Video not found")
    else:
        raise HTTPException(status_code=400, detail="Must provide video file or video_id")

    # Run analysis synchronously or return job ID
    pipeline = VideoAnalysisPipeline(
        person_conf_threshold=confidence_threshold,
        stationary_time_threshold=stationary_threshold,
        restricted_polygon=poly
    )

    try:
        results = pipeline.process_video(target_path)
        results["analysis_id"] = vid_id
        results["video_name"] = orig_name
        results["video_url"] = f"http://127.0.0.1:8000/videos/{os.path.basename(target_path)}"

        ANALYSIS_STORE[vid_id] = results
        if vid_id in ANALYSIS_JOBS:
            ANALYSIS_JOBS[vid_id]["status"] = "completed"
            ANALYSIS_JOBS[vid_id]["percentage"] = 100

        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ANALYSIS FAILED: {str(e)}")

# ========================================================
# STATUS & RESULTS RETRIEVAL
# ========================================================
@app.get("/api/videos/{analysis_id}/status")
@app.get("/api/analysis/{analysis_id}/status")
def get_analysis_status(analysis_id: str):
    if analysis_id in ANALYSIS_JOBS:
        job = ANALYSIS_JOBS[analysis_id]
        return {
            "analysis_id": analysis_id,
            "status": job.get("status", "unknown"),
            "percentage": job.get("percentage", 0),
            "frames_processed": job.get("frames_processed", 0),
            "total_frames": job.get("total_frames", 0)
        }
    elif analysis_id in ANALYSIS_STORE:
        return {
            "analysis_id": analysis_id,
            "status": "completed",
            "percentage": 100,
            "frames_processed": ANALYSIS_STORE[analysis_id]["metadata"]["processed_frames"],
            "total_frames": ANALYSIS_STORE[analysis_id]["metadata"]["total_frames"]
        }
    raise HTTPException(status_code=404, detail="Analysis job not found")

@app.get("/api/videos/{analysis_id}/results")
@app.get("/api/analysis/{analysis_id}")
@app.get("/api/analysis/{analysis_id}/results")
def get_analysis_results(analysis_id: str):
    if analysis_id in ANALYSIS_STORE:
        return ANALYSIS_STORE[analysis_id]

    # Check saved result on disk
    res_path = os.path.join(RESULTS_DIR, f"{analysis_id}.json")
    if os.path.exists(res_path):
        with open(res_path, "r") as f:
            data = json.load(f)
            ANALYSIS_STORE[analysis_id] = data
            return data

    raise HTTPException(status_code=404, detail="Analysis results not found or still processing")

@app.get("/api/analysis/{analysis_id}/frame")
def get_closest_frame(analysis_id: str, time: float = 0.0):
    if analysis_id not in ANALYSIS_STORE:
        raise HTTPException(status_code=404, detail="Analysis not found")

    frames = ANALYSIS_STORE[analysis_id].get("frames", [])
    if not frames:
        return {"timestamp": time, "detections": [], "tracks": []}

    closest = min(frames, key=lambda f: abs(f["timestamp"] - time))
    return closest

@app.get("/api/analysis/{analysis_id}/events")
def get_events(analysis_id: str, up_to_time: Optional[float] = None):
    if analysis_id not in ANALYSIS_STORE:
        raise HTTPException(status_code=404, detail="Analysis not found")

    events = ANALYSIS_STORE[analysis_id].get("events", [])
    if up_to_time is not None:
        events = [e for e in events if e["timestamp"] <= up_to_time]

    return {
        "analysis_id": analysis_id,
        "events": events
    }
