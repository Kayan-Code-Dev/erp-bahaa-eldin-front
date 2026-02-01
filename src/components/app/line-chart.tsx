import { useEffect, useRef, useState } from "react";

export function LineChartComponent() {
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

    // Data points - reversed for RTL
    const data = [38, 32, 35, 28, 30, 22, 25, 20, 18, 12, 15, 10];
    const labels = [
      "الأربعاء",
      "الثلاثاء",
      "الإثنين",
      "الأحد",
      "السبت",
      "الجمعة",
      "الخميس",
      "الأربعاء",
      "الثلاثاء",
      "الإثنين",
      "الأحد",
      "السبت",
    ];

    // Chart dimensions
    const padding = 40;
    const chartWidth = dimensions.width - padding * 2;
    const chartHeight = dimensions.height - padding * 2;

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = "#d0d3d9";
    ctx.lineWidth = 1;

    // Draw horizontal grid lines
    const gridCount = 5;
    for (let i = 0; i <= gridCount; i++) {
      const y = padding + (chartHeight / gridCount) * i;
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);

      // Add y-axis labels
      ctx.fillStyle = "#7a7a7a";
      ctx.font = "10px Cairo, Arial";
      ctx.textAlign = "right";
      const value = Math.round((40 - (40 / gridCount) * i) * 10) / 10;
      ctx.fillText(`${value}k`, padding - 5, y + 3);
    }
    ctx.stroke();

    // Draw line chart
    ctx.beginPath();
    ctx.strokeStyle = "#16c098";
    ctx.lineWidth = 2;

    const pointWidth = chartWidth / (data.length - 1);

    for (let i = 0; i < data.length; i++) {
      const x = padding + i * pointWidth;
      const y = padding + chartHeight - (data[i] / 40) * chartHeight;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw points
    for (let i = 0; i < data.length; i++) {
      const x = padding + i * pointWidth;
      const y = padding + chartHeight - (data[i] / 40) * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#16c098";
      ctx.fill();
    }

    // Draw x-axis labels
    ctx.fillStyle = "#7a7a7a";
    ctx.font = "10px Cairo, Arial";
    ctx.textAlign = "center";

    // Only show every other label on small screens
    const labelStep = dimensions.width < 500 ? 4 : 2;
    for (let i = 0; i < labels.length; i += labelStep) {
      const x = padding + i * pointWidth;
      ctx.fillText(labels[i], x, dimensions.height - 10);
    }

    // Fill area under the line
    ctx.beginPath();
    ctx.moveTo(padding, padding + chartHeight);

    for (let i = 0; i < data.length; i++) {
      const x = padding + i * pointWidth;
      const y = padding + chartHeight - (data[i] / 40) * chartHeight;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.closePath();
    ctx.fillStyle = "rgb(22 192 152 / 0.1)";
    ctx.fill();
  }, [dimensions]);

  return (
    <div ref={containerRef} className="w-full h-[300px]">
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  );
}
