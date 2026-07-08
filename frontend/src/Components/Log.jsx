import "./Log.css";

function Log({ logs }) {
  return (
    <div className="console">
      <h2>System Logs</h2>

      <div className="console-body">
        {logs.map((log, index) => (
          <p key={index} className={log.color}>
            [{log.time || "--:--:--"}] [{log.type}] {log.text}
          </p>
        ))}
      </div>
    </div>
  );
}

export default Log;
