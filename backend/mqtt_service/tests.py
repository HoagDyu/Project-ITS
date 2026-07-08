from django.test import TestCase
from unittest.mock import patch
from mqtt_service.mqtt_client import publish

class MqttPublishTests(TestCase):
    @patch("mqtt_service.mqtt_client.get_client")
    def test_publish_calls_client(self, mock_get_client):
        publish("test/topic", {"a": 1})
        mock_get_client.return_value.publish.assert_called_once()