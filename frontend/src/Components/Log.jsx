import { useEffect, useRef } from "react";
import "./Log.css";

function formatVehicle(vehicle, index) {
  const confidence =
    typeof vehicle.confidence === "number" ? `${(vehicle.confidence * 100).toFixed(0)}%` : "--";
  const trackId = vehicle.track_id ?? "--";

  return {
    id: `${trackId}-${index}`,
    type: vehicle.class || "object",
    confidence,
    trackId,
  };
}

function Log({ logs, currentFrame }) {
  const historyRef = useRef(null);
  const vehicles = currentFrame?.vehicles || [];
  const hasDetection = vehicles.length > 0;
  const detectionRows = vehicles.map(formatVehicle);

  useEffect(() => {
    const history = historyRef.current;
    if (!history) return;
    history.scrollTop = history.scrollHeight;
  }, [logs]);

  return (
    <div className="console">
      <section className="status-section">
        <h2>System Status</h2>
        <div className={hasDetection ? "status-pill status-alert" : "status-pill status-idle"}>
          {hasDetection ? "EMERGENCY DETECTED" : "MONITORING"}
        </div>
      </section>

      <section className="detection-section">
        <h3>Detection Info</h3>
        <div className="detection-body">
          {detectionRows.length === 0 ? (
            <p className="muted-line">No active detection</p>
          ) : (
            detectionRows.map((vehicle) => (
              <div className="detection-card" key={vehicle.id}>
                <p>
                  <span>Type</span>
                  <strong>{vehicle.type}</strong>
                </p>
                <p>
                  <span>Conf</span>
                  <strong>{vehicle.confidence}</strong>
                </p>
                <p>
                  <span>TrackID</span>
                  <strong>{vehicle.trackId}</strong>
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="history-section">
        <h3>Alert History</h3>
        <div className="console-body" ref={historyRef}>
          {logs.map((log, index) => (
            <p key={`${log.time}-${index}`} className={log.color}>
              [{log.time || "--:--:--"}] [{log.type}] {log.text}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Log;
