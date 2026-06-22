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
    @staticmethod
    def detect_object(frame):
        model = YOLO("yolov8n.pt")
        result = model(frame)
        return result

            

        
