import "./Uploader.css";
import { FaCloudUploadAlt } from "react-icons/fa";

const acceptedTypes = ".mov,.mp4,.png,.jpg,.jpeg,image/*,video/*";

function Uploader({ onUpload, isUploading }) {
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    onUpload(file);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    onUpload(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="upload-container">
      <h2>Upload File</h2>

      <div className="drop-zone" onDrop={handleDrop} onDragOver={handleDragOver}>
        <FaCloudUploadAlt className="upload-icon" />

        <h3>Keo & tha file</h3>
        <p>Hoac</p>

        <label className={`upload-btn ${isUploading ? "disabled" : ""}`}>
          {isUploading ? "Dang tai len..." : "Chon File"}
          <input
            type="file"
            accept={acceptedTypes}
            disabled={isUploading}
            onChange={handleFileChange}
          />
        </label>
      </div>
    </div>
  );
}

export default Uploader;
