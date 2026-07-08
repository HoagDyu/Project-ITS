import { useEffect, useRef } from "react";
import "./Preview.css";

function drawBoxes(ctx, vehicles) {
  if (!Array.isArray(vehicles)) return;

  ctx.lineWidth = Math.max(2, ctx.canvas.width / 400);
  ctx.font = `${Math.max(14, ctx.canvas.width / 60)}px sans-serif`;
  ctx.textBaseline = "alphabetic";

  vehicles.forEach((vehicle) => {
    if (!Array.isArray(vehicle.bbox) || vehicle.bbox.length < 4) return;

    const [x1, y1, x2, y2] = vehicle.bbox;
    const width = x2 - x1;
    const height = y2 - y1;
    if (width <= 0 || height <= 0) return;

    ctx.strokeStyle = "#22c55e";
    ctx.strokeRect(x1, y1, width, height);

    const confidence =
      typeof vehicle.confidence === "number" ? ` ${(vehicle.confidence * 100).toFixed(0)}%` : "";
    const label = `${vehicle.class || "object"}${confidence}`;
    const textWidth = ctx.measureText(label).width;
    const labelHeight = Math.max(20, ctx.canvas.width / 45);
    const labelY = Math.max(0, y1 - labelHeight);

    ctx.fillStyle = "#22c55e";
    ctx.fillRect(x1, labelY, textWidth + 8, labelHeight);
    ctx.fillStyle = "#0a0a0a";
    ctx.fillText(label, x1 + 4, labelY + labelHeight - 5);
  });
}

function Preview({ file, previewUrl, currentFrame }) {
  const canvasRef = useRef(null);
  const fallbackImgRef = useRef(null);
  const isVideo = file?.type?.startsWith("video/");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentFrame?.imageSrc) return;

    let cancelled = false;
    const image = new Image();

    image.onload = () => {
      if (cancelled) return;

      const frameWidth = currentFrame.width || image.naturalWidth;
      const frameHeight = currentFrame.height || image.naturalHeight;
      canvas.width = frameWidth;
      canvas.height = frameHeight;

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, frameWidth, frameHeight);
      ctx.drawImage(image, 0, 0, frameWidth, frameHeight);
      drawBoxes(ctx, currentFrame.vehicles);
    };

    image.src = currentFrame.imageSrc;

    return () => {
      cancelled = true;
    };
  }, [currentFrame]);

  useEffect(() => {
    if (isVideo || currentFrame || !previewUrl) return;

    const canvas = canvasRef.current;
    const image = fallbackImgRef.current;
    if (!canvas || !image) return;

    const drawFallbackImage = () => {
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };

    if (image.complete) drawFallbackImage();
    else image.addEventListener("load", drawFallbackImage);

    return () => image.removeEventListener("load", drawFallbackImage);
  }, [currentFrame, isVideo, previewUrl]);

  return (
    <div className="preview-container">
      <h2>Media Preview</h2>

      <div className="media-box">
        {!previewUrl && <p className="empty-preview">Chua co file duoc chon.</p>}

        {previewUrl && (
          <div className="media-stage">
            {(currentFrame || !isVideo) && <canvas ref={canvasRef} className="frame-canvas" />}
            {!currentFrame && !isVideo && (
              <img
                ref={fallbackImgRef}
                src={previewUrl}
                alt={file?.name || "Preview"}
                className="hidden-frame-source"
              />
            )}
            {!currentFrame && isVideo && <p className="empty-preview">Dang cho frame tu backend...</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default Preview;
