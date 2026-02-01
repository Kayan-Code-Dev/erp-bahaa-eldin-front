import { useEffect, useRef, useState } from "react";

export function DonutChartComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    handleResize(); // Initial size

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Draw chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions with device pixel ratio for sharpness
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;
    ctx.scale(dpr, dpr);

    // Data
    const data = [
      { value: 75, color: "#16c098" },
      { value: 25, color: "#cf0c0c" },
    ];

    // Chart dimensions
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    const innerRadius = radius * 0.6;

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Draw donut chart
    let startAngle = 0;

    for (const item of data) {
      const sliceAngle = (item.value / 100) * 2 * Math.PI;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.arc(
        centerX,
        centerY,
        innerRadius,
        startAngle + sliceAngle,
        startAngle,
        true
      );
      ctx.closePath();

      ctx.fillStyle = item.color;
      ctx.fill();

      startAngle += sliceAngle;
    }

    // Draw center circle (white)
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius - 2, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  }, [dimensions]);

  return (
    <div ref={containerRef} className="w-full h-[200px]">
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  );
}
