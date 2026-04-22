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

    const getDocSize = () => {
      const docEl = document.documentElement;
      const body = document.body;
      const w = Math.max(
        docEl.clientWidth,
        docEl.scrollWidth,
        body.scrollWidth,
      );
      const h = Math.max(
        docEl.clientHeight,
        docEl.scrollHeight,
        body.scrollHeight,
      );
      return { w, h };
    };

    let lastW = 0;
    let lastH = 0;

    const draw = () => {
      const { w, h } = getDocSize();
      if (w === 0 || h === 0) return;
      if (w === lastW && h === lastH) return;
      lastW = w;
      lastH = h;

      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
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
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(draw, 150);
    };

    const ro = new ResizeObserver(schedule);
    ro.observe(document.documentElement);
    ro.observe(document.body);
    window.addEventListener("resize", schedule);

    return () => {
      ro.disconnect();
      window.clearTimeout(timer);
      window.removeEventListener("resize", schedule);
    };
  }, [cellSize, color, backgroundColor, chipColor, lineWidth, density, seed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: -1,
        pointerEvents: "none",
        display: "block",
        ...style,
      }}
    />
  );
}
