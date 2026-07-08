from django.apps import AppConfig
import base64
import cv2 as cv
import numpy as np
from pathlib import Path
import tempfile
from ultralytics import YOLO


class AiEngineConfig(AppConfig):
    name = 'ai_engine'

class ReadFile:
    @staticmethod
    def encode_frame(frame, quality=80):
        ok, buffer = cv.imencode(".jpg", frame, [int(cv.IMWRITE_JPEG_QUALITY), quality])
        if not ok:
            raise ValueError("Khong the encode frame thanh JPEG")
        return base64.b64encode(buffer).decode("ascii")

    @staticmethod
    def build_frame_payload(frame, vehicles, quality=80):
        height, width = frame.shape[:2]
        return {
            "vehicles": vehicles,
            "frame_width": width,
            "frame_height": height,
            "frame_image": ReadFile.encode_frame(frame, quality),
            "frame_mime": "image/jpeg",
        }

    @staticmethod
    def process_file(file):
        if file is None:
            return None

        if file.name.lower().endswith(('.png', '.jpeg', '.jpg')):
            return ReadFile.read_img(file)
        elif file.name.lower().endswith(('.mp4', '.mov')):
            return ReadFile.read_vid(file)

        return None

    @staticmethod
    def read_img(file):
        img = []
        file_bytes = file.read()
        np_array = np.frombuffer(file_bytes, np.uint8)
        img_read = cv.imdecode(np_array, cv.IMREAD_COLOR)
        if img_read is None:
            raise ValueError("Khong the doc anh upload")
        vehicles = DetectObject.detect_object(img_read)
        height, width = img_read.shape[:2]
        img.append({
            "vehicles": vehicles,
            "frame_width": width,
            "frame_height": height,
        })
        return img

    @staticmethod
    def read_vid(file):
        suffix = Path(file.name).suffix
        temp_path = None

        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
                temp_path = Path(temp_file.name)

                if hasattr(file, "chunks"):
                    for chunk in file.chunks():
                        temp_file.write(chunk)
                else:
                    temp_file.write(file.read())

            cap = cv.VideoCapture(str(temp_path))
            fps = cap.get(cv.CAP_PROP_FPS) or 25

            try:
                while True:
                    ret, frame = cap.read()
                    if not ret:
                        break
                    detected_obj = DetectObject.detect_object(frame)
                    frame_payload = ReadFile.build_frame_payload(frame, detected_obj, quality=70)
                    yield {**frame_payload, "fps": fps}
            finally:
                cap.release()
        finally:
            if temp_path and temp_path.exists():
                temp_path.unlink()

class DetectObject:
    _model = YOLO("detect_best.pt")

    @staticmethod
    def detect_object(frame):
        result = DetectObject._model.track(source=frame, tracker = "botsort.yaml", persist=True, verbose=False, conf=0.4)[0]
        detections = []
        for box in result.boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()      
            conf = float(box.conf[0])                   
            cls_id = int(box.cls[0])                    
            cls_name = DetectObject._model.names[cls_id] 
            track_id = int(box.id[0]) if box.id is not None else None
            detections.append({
                "track_id": track_id,
                "class": cls_name,
                "confidence": round(conf, 2),
                "bbox": [round(x1,1), round(y1,1), round(x2,1), round(y2,1)]
            })
        return detections



        
