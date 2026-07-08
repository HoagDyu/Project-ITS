import "./Preview.css";

function Preview({ file, previewUrl }) {
  const isVideo = file?.type?.startsWith("video/");

  return (
    <div className="preview-container">
      <h2>Media Preview</h2>

      <div className="media-box">
        {!previewUrl && <p className="empty-preview">Chua co file duoc chon.</p>}

        {previewUrl && isVideo && (
          <video controls src={previewUrl}>
            Trinh duyet khong ho tro video.
          </video>
        )}

        {previewUrl && !isVideo && (
          <img src={previewUrl} alt={file?.name || "Preview"} />
        )}
      </div>
    </div>
  );
}

export default Preview;
