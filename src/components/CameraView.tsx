import React, { useRef, useEffect, useState } from "react";
import "./CameraView.css";

type FilterType = "none" | "grayscale" | "sepia" | "retro" | "invert";

const filters: Record<FilterType, string> = {
  none: "",
  grayscale: "grayscale(1)",
  sepia: "sepia(1)",
  retro: "contrast(1.2) sepia(0.7) saturate(0.8) brightness(1.1)",
  invert: "invert(1)",
};

const filterOrder: FilterType[] = [
  "none",
  "grayscale",
  "sepia",
  "invert",
  "retro",
];
const filterLabels: Record<FilterType, string> = {
  none: "없음",
  grayscale: "흑백",
  sepia: "세피아",
  invert: "반전",
  retro: "레트로",
};

const CameraView: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [filter, setFilter] = useState<FilterType>("none");
  const [error, setError] = useState<string | null>(null);
  const [pixelSize, setPixelSize] = useState<number>(8);

  useEffect(() => {
    const getCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("카메라 접근이 거부되었습니다.");
      }
    };
    getCamera();
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    let animationId: number;

    const drawFrame = () => {
      if (!videoRef.current || !canvasRef.current) {
        animationId = requestAnimationFrame(drawFrame);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        animationId = requestAnimationFrame(drawFrame);
        return;
      }

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        animationId = requestAnimationFrame(drawFrame);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (filter === "retro") {
        const scale = 1 / pixelSize;
        const sw = Math.max(1, Math.floor(video.videoWidth * scale));
        const sh = Math.max(1, Math.floor(video.videoHeight * scale));

        ctx.save();
        ctx.filter = filters["retro"];
        ctx.drawImage(video, 0, 0, sw, sh);

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          canvas,
          0,
          0,
          sw,
          sh,
          0,
          0,
          video.videoWidth,
          video.videoHeight
        );
        ctx.restore();

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.floor(data[i] / 64) * 64;
          data[i + 1] = Math.floor(data[i + 1] / 64) * 64;
          data[i + 2] = Math.floor(data[i + 2] / 64) * 64;
        }
        ctx.putImageData(imageData, 0, 0);
      } else {
        ctx.save();
        ctx.filter = filters[filter];
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      animationId = requestAnimationFrame(drawFrame);
    };

    animationId = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(animationId);
  }, [filter, pixelSize]);

  return (
    <div className="camera-container">
      <div className="controls">
        <div className="filter-group">
          {filterOrder.map((filterType) => (
            <label key={filterType} className="filter-option">
              <input
                type="radio"
                name="filter"
                value={filterType}
                checked={filter === filterType}
                onChange={() => setFilter(filterType)}
              />
              {filterLabels[filterType]}
            </label>
          ))}
        </div>

        {filter === "retro" && (
          <div className="pixel-control">
            <label>픽셀 크기: </label>
            <input
              type="range"
              min="4"
              max="16"
              value={pixelSize}
              onChange={(e) => setPixelSize(Number(e.target.value))}
            />
            <span>{pixelSize}</span>
          </div>
        )}
      </div>

      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="preview-container">
          <video ref={videoRef} className="hidden-video" autoPlay playsInline />
          <canvas ref={canvasRef} className="preview-canvas" />
        </div>
      )}
    </div>
  );
};

export default CameraView;
