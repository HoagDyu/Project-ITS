from pathlib import Path

from ultralytics import YOLO


if __name__ == "__main__":
    model = YOLO("yolov8n.pt")

    model.train(
        data="dataset/data.yaml",
        epochs=40,
        imgsz=640,
        batch=8,
        device=0,
        workers=0,
    )
