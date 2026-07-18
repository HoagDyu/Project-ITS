# Priority Vehicles Detection System

Hệ thống phát hiện và nhận dạng phương tiện ưu tiên (xe cấp cứu, cảnh sát, cứu hỏa) sử dụng mô hình YOLOv8 (You Only Look Once).

## Mô tả dự án

Dự án này cung cấp một giải pháp toàn diện để:

- **Phát hiện** các phương tiện ưu tiên trong hình ảnh/video
- **Xử lý** yêu cầu qua REST API
- **Giao tiếp** theo thời gian thực qua MQTT
- **Quản lý** mô hình AI và huấn luyện lại dữ liệu mới

### Các loại phương tiện được nhận dạng:

- **Ambulance** (Xe cấp cứu)
- **Police** (Xe cảnh sát)
- **Pompier** (Xe cứu hỏa)

## Kiến trúc hệ thống

```
Priority Vehicles Detection System
├── Frontend (React + Vite)
│   └── UI để upload hình ảnh và xem kết quả
├── Backend (Django REST API)
│   ├── Core API - REST endpoints
│   ├── AI Engine - Xử lý YOLO detection
│   └── MQTT Service - Giao tiếp IoT
└── ML Models (YOLOv8)
    ├── yolov8n.pt - Mô hình cơ bản
    ├── yolo26n.pt - Mô hình thay thế
    └── detect_best.pt - Mô hình đã huấn luyện tốt nhất
```

## Hướng dẫn cài đặt

### Yêu cầu hệ thống

- **Python**: 3.8+
- **Node.js**: 14+
- **MQTT Broker**: (Mosquitto hoặc tương tự)

### 1. Clone repository

```bash
git clone <repository-url>
cd Project-ITS
```

### 2. Cài đặt Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt

# Tạo database
python manage.py migrate

# Chạy server
python manage.py runserver
```

Server sẽ chạy tại: `http://localhost:8000`

### 3. Cài đặt Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

### 4. Cấu hình MQTT (tùy chọn)

Trong file `.env` của backend, cấu hình:

```
MQTT_BROKER_HOST=localhost
MQTT_BROKER_PORT=1883
MQTT_TOPIC_PREFIX=detection/
```

## Cấu trúc thư mục

```
Project-ITS/
├── backend/
│   ├── ai_engine/              # Xử lý AI/ML
│   │   ├── train_model.py     # Huấn luyện mô hình
│   │   ├── mqtt_bridge.py     # Cầu nối MQTT
│   │   └── apps.py
│   ├── core_api/               # REST API
│   │   ├── views.py            # API endpoints
│   │   ├── serializers.py      # Data serialization
│   │   ├── settings.py         # Django settings
│   │   └── urls.py             # URL routing
│   ├── mqtt_service/           # Dịch vụ MQTT
│   │   └── mqtt_client.py      # MQTT client
│   ├── manage.py               # Django management
│   └── requirements.txt         # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── Components/         # React components
│   │   ├── api/                # API calls
│   │   ├── hooks/              # Custom hooks
│   │   ├── Layout.jsx          # Main layout
│   │   └── main.jsx            # Entry point
│   ├── package.json            # Node dependencies
│   └── vite.config.js          # Vite config
├── dataset/
│   ├── data.yaml               # YOLO dataset config
│   ├── train/                  # Training images & labels
│   ├── valid/                  # Validation images & labels
│   └── test/                   # Test images & labels
├── runs/                       # Training outputs
│   └── detect/
│       ├── train/              # Training results
│       ├── train-2, train-3... # Multiple training runs
└── yolo*.pt                    # Pre-trained models
```
