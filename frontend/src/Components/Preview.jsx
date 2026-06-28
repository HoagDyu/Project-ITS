import "./Preview.css";

function Preview() {
  return (
    <div className="preview-container">
      <h2>Media Preview</h2>

      <div className="media-box">
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70"
          alt="Preview"
        />
      </div>

      <div className="media-box">
        <video controls>
          <source
            src="https://www.w3schools.com/html/mov_bbb.mp4"
            type="video/mp4"
          />
          Trình duyệt không hỗ trợ video.
        </video>
      </div>
    </div>
  );
}

export default Preview;
