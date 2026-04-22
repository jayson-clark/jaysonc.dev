import { useEffect, useRef, type CSSProperties } from "react";
import { generate } from "./generate";
import { render } from "./render";

export type CircuitBackgroundProps = {
  cellSize?: number;
  color?: string;
  backgroundColor?: string;
  chipColor?: string;
  lineWidth?: number;
  density?: number;
  seed?: number;
  style?: CSSProperties;
  className?: string;
};

export function CircuitBackground({
  cellSize = 10,
  color = "#22d3ee",
  backgroundColor = "#0a1620",
  chipColor,
  lineWidth = 1.1,
  density = 0.6,
  seed,
  style,
  className,
}: CircuitBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.ceil(w / cellSize);
      const rows = Math.ceil(h / cellSize);
      const data = generate({ cols, rows, seed, density });
      render(ctx, data, {
        cellSize,
        color,
        backgroundColor,
        chipColor,
        lineWidth,
      });
    };

    draw();

    let timer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(draw, 150);
    });
    ro.observe(canvas);

    return () => {
      ro.disconnect();
      window.clearTimeout(timer);
    };
  }, [cellSize, color, backgroundColor, chipColor, lineWidth, density, seed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        pointerEvents: "none",
        display: "block",
        ...style,
      }}
    />
  );
}
