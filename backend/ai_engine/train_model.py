from ultralytics import YOLO

# Bọc toàn bộ code thực thi vào trong khối if __name__ == '__main__'
if __name__ == '__main__':
    # Khởi tạo model
    model = YOLO("yolov8n.pt")
    
    # Bắt đầu huấn luyện
    model.train(
        data="dataset/data.yaml",
        epochs=10,
        imgsz=640,
        batch=8,
        device=0,
        workers=1,
    )