import "./Log.css";

function Log() {
  const logs = [
    {
      type: "INFO",
      text: "Bắt đầu phân tích hình ảnh...",
      color: "info",
    },
    {
      type: "SUCCESS",
      text: "Đã phát hiện xe cứu thương.",
      color: "success",
    },
    {
      type: "WARNING",
      text: "Confidence thấp hơn ngưỡng.",
      color: "warning",
    },
    {
      type: "INFO",
      text: "Đang theo dõi đối tượng...",
      color: "info",
    },
    {
      type: "ERROR",
      text: "Không đọc được frame số 152.",
      color: "error",
    },
  ];

  return (
    <div className="console">
      <h2>System Logs</h2>

      <div className="console-body">
        {logs.map((log, index) => (
          <p key={index} className={log.color}>
            [10:14:{10 + index} PM] [{log.type}] {log.text}
          </p>
        ))}
      </div>
    </div>
  );
}

export default Log;
