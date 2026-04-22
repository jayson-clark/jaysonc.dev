import { useEffect, useRef, type CSSProperties } from "react";
import { generate } from "./generate";
import {
  createLightingState,
  drawLighting,
  precomputeScene,
  updateLighting,
  type LightingState,
} from "./lighting";
import { render } from "./render";

export type CircuitBackgroundProps = {
  cellSize?: number;
  color?: string;
  backgroundColor?: string;
  chipColor?: string;
  lineWidth?: number;
  density?: number;
  seed?: number;
  dimAlpha?: number;
  cursorRadius?: number;
  emitInterval?: number;
  pulseSpeed?: number;
  maxPulseHops?: number;
  pulseThickness?: number;
  pulseLife?: number;
  fadeTau?: number;
  style?: CSSProperties;
  className?: string;
};

export function CircuitBackground({
  cellSize = 10,
  color = "#22d3ee",
  backgroundColor = "#0a1620",
  chipColor,
  lineWidth = 0.5,
  density = 0.6,
  seed,
  dimAlpha = 0.05,
  cursorRadius = 15,
  emitInterval = 0.11,
  pulseSpeed = 100,
  maxPulseHops = 15,
  pulseThickness = 14,
  pulseLife = 1.5,
  fadeTau = 0.15,
  style,
  className,
}: CircuitBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const baseCanvas = document.createElement("canvas");
    const baseCtx = baseCanvas.getContext("2d");
    if (!baseCtx) return;

    const state: {
      lighting: LightingState | null;
      dpr: number;
      lastW: number;
      lastH: number;
      cursor: { x: number; y: number; active: boolean };
      clientX: number;
      clientY: number;
      hasClient: boolean;
    } = {
      lighting: null,
      dpr: 1,
      lastW: 0,
      lastH: 0,
      cursor: { x: -99999, y: -99999, active: false },
      clientX: 0,
      clientY: 0,
      hasClient: false,
    };

    const lightingOpts = {
      color,
      lineWidth,
      cursorRadius,
      emitInterval,
      pulseSpeed,
      maxPulseHops,
      pulseThickness,
      pulseLife,
      fadeTau,
    };

    const getDocSize = () => {
      const docEl = document.documentElement;
      const body = document.body;
      return {
        w: Math.max(docEl.clientWidth, docEl.scrollWidth, body.scrollWidth),
        h: Math.max(docEl.clientHeight, docEl.scrollHeight, body.scrollHeight),
      };
    };

    const buildScene = (force: boolean): boolean => {
      const { w, h } = getDocSize();
      if (w === 0 || h === 0) return false;
      if (!force && w === state.lastW && h === state.lastH) return false;
      state.lastW = w;
      state.lastH = h;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      state.dpr = dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const pw = Math.floor(w * dpr);
      const ph = Math.floor(h * dpr);
      canvas.width = pw;
      canvas.height = ph;
      baseCanvas.width = pw;
      baseCanvas.height = ph;

      baseCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.ceil(w / cellSize);
      const rows = Math.ceil(h / cellSize);
      const data = generate({ cols, rows, seed, density });
      render(baseCtx, data, {
        cellSize,
        color,
        backgroundColor,
        chipColor,
        lineWidth,
      });
      baseCtx.globalAlpha = 1 - dimAlpha;
      baseCtx.fillStyle = backgroundColor;
      baseCtx.fillRect(0, 0, w, h);
      baseCtx.globalAlpha = 1;

      const scene = precomputeScene(data, cellSize);
      state.lighting = createLightingState(scene);
      return true;
    };

    const paint = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(baseCanvas, 0, 0);
      ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
      if (state.lighting) drawLighting(ctx, state.lighting, lightingOpts);
    };

    let rafId = 0;
    const scheduleFrame = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(tick);
    };
    const tick = (nowMs: number) => {
      rafId = 0;
      if (!state.lighting) return;
      const now = nowMs / 1000;
      const hasLight = updateLighting(
        state.lighting,
        state.cursor,
        now,
        lightingOpts,
      );
      paint();
      if (hasLight || state.cursor.active) scheduleFrame();
    };

    const onMove = (e: MouseEvent) => {
      state.clientX = e.clientX;
      state.clientY = e.clientY;
      state.hasClient = true;
      state.cursor.x = e.pageX;
      state.cursor.y = e.pageY;
      state.cursor.active = true;
      scheduleFrame();
    };
    const onLeave = () => {
      state.cursor.active = false;
      scheduleFrame();
    };
    const onScroll = () => {
      if (!state.hasClient) return;
      state.cursor.x = state.clientX + window.scrollX;
      state.cursor.y = state.clientY + window.scrollY;
      if (state.cursor.active) scheduleFrame();
    };

    buildScene(true);
    paint();

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });

    let resizeTimer = 0;
    const scheduleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (buildScene(false)) paint();
      }, 150);
    };
    const ro = new ResizeObserver(scheduleResize);
    ro.observe(document.documentElement);
    ro.observe(document.body);
    window.addEventListener("resize", scheduleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(resizeTimer);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", scheduleResize);
    };
  }, [
    cellSize,
    color,
    backgroundColor,
    chipColor,
    lineWidth,
    density,
    seed,
    dimAlpha,
    cursorRadius,
    emitInterval,
    pulseSpeed,
    maxPulseHops,
    pulseThickness,
    pulseLife,
    fadeTau,
  ]);

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
