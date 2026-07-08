/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from "react";
import Uploader from "./Components/Uploader";
import Preview from "./Components/Preview";
import Log from "./Components/Log";
import { uploadForDetection } from "./api/detection";
import { useMqtt } from "./hooks/useMqtt";
import "./Layout.css";

function formatTime() {
  return new Date().toLocaleTimeString("vi-VN", { hour12: false });
}

function getTrackIdText(vehicles) {
  const trackIds = vehicles
    .map((vehicle) => vehicle.track_id)
    .filter((trackId) => trackId !== null && trackId !== undefined)
    .join(", ");

  return trackIds ? ` | TrackID: ${trackIds}` : "";
}

function Layout() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [fps, setFps] = useState(null);
  const [imageVehicles, setImageVehicles] = useState(null);
  const [latestFrameIndex, setLatestFrameIndex] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(null);

  const processedTopics = useRef(new Set());
  const framesRef = useRef({});

  const { messages, connected } = useMqtt(sessionId ? `detection/${sessionId}/#` : null);

  const addLog = (type, text, color = "") => {
    setLogs((prev) => [...prev, { time: formatTime(), type, text, color }]);
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!sessionId || messages.length === 0) return;

    const last = messages[messages.length - 1];
    const key = `${last.topic}-${last.time}-${last.data?.frame_index ?? ""}-${last.data?.status ?? ""}`;
    if (processedTopics.current.has(key)) return;
    processedTopics.current.add(key);

    const data = last.data;

    if (last.topic.endsWith("/frame")) {
      const vehicles = data.vehicles || [];
      framesRef.current[data.frame_index] = vehicles;
      if (data.fps) queueMicrotask(() => setFps(data.fps));
      queueMicrotask(() => setLatestFrameIndex(data.frame_index));

      if (data.frame_image) {
        queueMicrotask(() =>
          setCurrentFrame({
            frameIndex: data.frame_index,
            imageSrc: `data:${data.frame_mime || "image/jpeg"};base64,${data.frame_image}`,
            width: data.frame_width,
            height: data.frame_height,
            vehicles,
          })
        );
      }

      addLog(
        "DETECT",
        `Frame ${data.frame_index}: ${vehicles.length} phuong tien${getTrackIdText(vehicles)}`,
        "log-info"
      );
    } else if (last.topic.endsWith("/result")) {
      if (data.status === "done") {
        const vehicles = data.vehicles || [];
        const count = data.type === "image" ? vehicles.length : data.total_frames;

        if (data.type === "image") {
          queueMicrotask(() => setImageVehicles(vehicles));
          if (data.frame_image) {
            queueMicrotask(() =>
              setCurrentFrame({
                frameIndex: 0,
                imageSrc: `data:${data.frame_mime || "image/jpeg"};base64,${data.frame_image}`,
                width: data.frame_width,
                height: data.frame_height,
                vehicles,
              })
            );
          }
        } else if (data.fps) {
          queueMicrotask(() => setFps(data.fps));
        }

        addLog(
          "SUCCESS",
          data.type === "image"
            ? `Hoan tat: phat hien ${count} doi tuong${getTrackIdText(vehicles)}`
            : `Hoan tat: da xu ly ${count} frame`,
          "log-success"
        );
      } else if (data.status === "error") {
        addLog("ERROR", data.message, "log-error");
      }
    }
  }, [messages, sessionId]);

  useEffect(() => {
    if (sessionId && connected) {
      addLog("INFO", `Da ket noi MQTT, dang lang nghe session ${sessionId}`, "log-info");
    }
  }, [connected, sessionId]);

  const handleUpload = async (selectedFile) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setIsUploading(true);
    setSessionId(null);
    setFps(null);
    setImageVehicles(null);
    setLatestFrameIndex(null);
    setCurrentFrame(null);
    framesRef.current = {};
    processedTopics.current.clear();
    addLog("INFO", `Dang tai len: ${selectedFile.name}`, "log-info");

    try {
      const { session_id } = await uploadForDetection(selectedFile);
      setSessionId(session_id);
      addLog("INFO", `Tai len thanh cong, session: ${session_id}`, "log-info");
    } catch (err) {
      addLog("ERROR", err.message || "Tai len that bai", "log-error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="layout">
      <section className="preview-panel">
        <Preview
          file={file}
          previewUrl={previewUrl}
          framesRef={framesRef}
          fps={fps}
          latestFrameIndex={latestFrameIndex}
          currentFrame={currentFrame}
          imageVehicles={imageVehicles}
        />
      </section>

      <aside className="side-panel">
        <section className="upload-panel">
          <Uploader onUpload={handleUpload} isUploading={isUploading} />
        </section>

        <section className="log-panel">
          <Log logs={logs} currentFrame={currentFrame} />
        </section>
      </aside>
    </div>
  );
}

export default Layout;
