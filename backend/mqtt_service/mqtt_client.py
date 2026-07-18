import ssl
import json
import os
import logging
import paho.mqtt.client as mqtt

logger = logging.getLogger(__name__)


def _get_env(key: str) -> str:
    value = os.environ.get(key)
    if not value:
        raise RuntimeError(f"Thiếu {key}")
    return value


MQTT_HOST = _get_env("MQTT_HOST")
MQTT_PORT = int(os.environ.get("MQTT_PORT", 8883))
MQTT_USER = _get_env("MQTT_USER")
MQTT_PASS = _get_env("MQTT_PASS")

_client = None


def get_client():
    global _client
    if _client is None:
        _client = _build_client()
    return _client


def on_connect(client, userdata, flags, rc, properties=None):
    logger.info("MQTT connected" if rc == 0 else f"MQTT connect thất bại, rc={rc}")


def on_disconnect(client, userdata, rc, properties=None):
    logger.warning(f"MQTT bị ngắt kết nối, rc={rc}")


def _build_client():
    client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2,
    client_id="backend_publisher"
    )
    client.username_pw_set(username=MQTT_USER, password=MQTT_PASS)
    client.tls_set(tls_version=ssl.PROTOCOL_TLS_CLIENT)
    client.on_connect = on_connect
    client.on_disconnect = on_disconnect
    client.connect(host=MQTT_HOST, port=MQTT_PORT, keepalive=60)
    client.loop_start()
    return client

def publish(topic: str, payload: dict, qos: int = 0, retain: bool = False):
    client = get_client()
    result = client.publish(topic=topic, payload=json.dumps(payload),qos=qos,retain=retain)
    result.wait_for_publish(timeout=5)
    if not result.is_published():
        logger.error(f"Publish không thành công, topic = {topic}")
    return result.is_published()