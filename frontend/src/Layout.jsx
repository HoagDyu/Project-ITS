import "./Layout.css";
import { useEffect, useState } from "react";
import Uploader from "./Components/Uploader";
import Preview from "./Components/Preview";
import Log from "./Components/Log";
import { uploadMedia } from "./api";

function Layout() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [logs, setLogs] = useState([
    {
      type: "INFO",
      text: "He thong san sang nhan file anh/video.",
      color: "info",
      time: new Date().toLocaleTimeString(),
    },
  ]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const addLog = (type, text, color) => {
    setLogs((currentLogs) => [
      ...currentLogs,
      {
        type,
        text,
        color,
        time: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const handleUpload = async (file) => {
    if (!file) return;

    const nextPreviewUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(nextPreviewUrl);
    setIsUploading(true);
    addLog("INFO", `Dang gui file "${file.name}" len backend...`, "info");

    try {
      const data = await uploadMedia(file);
      addLog("SUCCESS", data.status || "Backend da nhan file thanh cong.", "success");
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.message ||
        "Khong the ket noi toi backend.";
      addLog("ERROR", message, "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="layout-container">
      <div className="left-panel">
        <Uploader onUpload={handleUpload} isUploading={isUploading} />
      </div>

      <div className="right-panel">
        <Preview file={selectedFile} previewUrl={previewUrl} />
        <Log logs={logs} />
      </div>
    </div>
  );
}

export default Layout;
