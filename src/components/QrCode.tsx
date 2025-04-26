import React, { useEffect, useRef } from "react";
import { generate } from "lean-qr";
import "./QrCode.css";

const QrCode: React.FC<{
  data: string;
  width?: number;
  height?: number;
}> = ({ data, width = 128, height = 128 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const qrCode = generate(data);
      qrCode.toCanvas(canvasRef.current);
    }
  }, [data]);

  return (
    <div style={{ textAlign: "center" }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ imageRendering: "pixelated", width, height }}
      />
      <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
        {window.location.href}
      </div>
    </div>
  );
};

export default QrCode;
