from django.apps import AppConfig
import cv2 as cv
import numpy as np
from pathlib import Path
import tempfile
from ultralytics import YOLO


class AiEngineConfig(AppConfig):
    name = 'ai_engine'

class ReadFile:
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
        img_detect = DetectObject.detect_object(img_read)
        img.append(img_detect)
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

            try:
                while True:
                    ret, frame = cap.read()
                    if not ret:
                        break
                    detected_obj = DetectObject.detect_object(frame)
                    yield detected_obj
            finally:
                cap.release()
        finally:
            if temp_path and temp_path.exists():
                temp_path.unlink()

class DetectObject:
    _model = YOLO(r"D:\Code\project\Project-ITS\backend\detect_best.pt")

    @staticmethod
    def detect_object(frame):
        result = DetectObject._model.track(source=frame, tracker = "botsort.yaml", persist=True, verbose=False, conf=0.3)[0]
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



        
