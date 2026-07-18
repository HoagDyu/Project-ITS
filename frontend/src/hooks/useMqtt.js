import { useEffect, useRef, useState } from "react";
import mqtt from "mqtt";

export function useMqtt(topic) {
  const clientRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!topic) return;

    queueMicrotask(() => {
      setMessages([]);
      setConnected(false);
    });

    const client = mqtt.connect(import.meta.env.VITE_MQTT_URL, {
      username: import.meta.env.VITE_MQTT_USER,
      password: import.meta.env.VITE_MQTT_PASS,
      clientId: "webapp_" + Math.random().toString(16).slice(2),
      clean: true,
      reconnectPeriod: 2000,
    });

    client.on("connect", () => {
      setConnected(true);
      client.subscribe(topic);
    });

    client.on("message", (t, payload) => {
      try {
        const data = JSON.parse(payload.toString());
        setMessages((prev) => [...prev.slice(-30), { topic: t, data, time: Date.now() }]);
      } catch {
        setMessages((prev) => [...prev.slice(-30), { topic: t, data: payload.toString(), time: Date.now() }]);
      }
    });

    client.on("error", (err) => console.error("MQTT error:", err));

    return () => client.end();
  }, [topic]);

  return { messages, connected };
}
