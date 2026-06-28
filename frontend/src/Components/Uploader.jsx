import "./Uploader.css";
import { FaCloudUploadAlt } from "react-icons/fa";

function Uploader() {
  return (
    <div className="upload-container">

      <h2>Upload File</h2>

      <div className="drop-zone">

        <FaCloudUploadAlt className="upload-icon"/>

        <h3>Kéo & Thả File</h3>

        <p>Hoặc</p>

        <button className="upload-btn">
          Chọn File
        </button>

      </div>

    </div>
  );
}

export default Uploader;