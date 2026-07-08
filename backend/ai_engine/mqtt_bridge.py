import io
from mqtt_service.mqtt_client import publish


class InMemoryFileWrapper:
    def __init__(self, name: str, content: bytes):
        self.name = name
        self._buffer = io.BytesIO(content)

    def read(self, *args, **kwargs):
        return self._buffer.read(*args, **kwargs)

    def chunks(self, chunk_size=8192):
        while True:
            data = self._buffer.read(chunk_size)
            if not data:
                break
            yield data


def process_and_publish(file_wrapper, session_id: str):
    from ai_engine.apps import ReadFile

    name_lower = file_wrapper.name.lower()
    is_image = name_lower.endswith(('.png', '.jpeg', '.jpg'))
    is_video = name_lower.endswith(('.mp4', '.mov'))

    if not is_image and not is_video:
        publish(f"detection/{session_id}/result", {
            "session_id": session_id,
            "status": "error",
            "message": "Định dạng file không được hỗ trợ",
        }, qos=1)
        return

    try:
        result = ReadFile.process_file(file_wrapper)

        if is_image:
            frame_data = result[0] if result else {}
            detections = frame_data.get("vehicles", [])
            publish(f"detection/{session_id}/result", {
                "session_id": session_id,
                "status": "done",
                "type": "image",
                "vehicles": detections,
                "frame_width": frame_data.get("frame_width"),
                "frame_height": frame_data.get("frame_height"),
                "frame_image": frame_data.get("frame_image"),
                "frame_mime": frame_data.get("frame_mime"),
            }, qos=1)

        else:  # video — result là generator, publish từng frame
            frame_index = 0
            fps = None
            for frame_data in result:
                vehicles = frame_data["vehicles"]
                fps = frame_data["fps"]

                publish(f"detection/{session_id}/frame", {
                    "session_id": session_id,
                    "status": "processing",
                    "frame_index": frame_index,
                    "fps": fps,
                    "vehicles": vehicles,
                    "frame_width": frame_data["frame_width"],
                    "frame_height": frame_data["frame_height"],
                    "frame_image": frame_data["frame_image"],
                    "frame_mime": frame_data["frame_mime"],
                }, qos=0)
                frame_index += 1

            publish(f"detection/{session_id}/result", {
                "session_id": session_id,
                "status": "done",
                "type": "video",
                "total_frames": frame_index,
                "fps": fps,
            }, qos=1)

    except Exception as e:
        publish(f"detection/{session_id}/result", {
            "session_id": session_id,
            "status": "error",
            "message": str(e),
        }, qos=1)
