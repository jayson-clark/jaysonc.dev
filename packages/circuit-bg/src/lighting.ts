import type { CircuitData } from "./types";

export type TraceDraw = {
  vertices: Array<[number, number]>;
  arcLengths: number[];
  totalLength: number;
  excitation: Float32Array;
  lagArc: number;
  hasLag: boolean;
  bboxMinX: number;
  bboxMinY: number;
  bboxMaxX: number;
  bboxMaxY: number;
};

export function precomputeTraces(
  data: CircuitData,
  cellSize: number,
): TraceDraw[] {
  const out: TraceDraw[] = [];
  for (const trace of data.traces) {
    const vertices: Array<[number, number]> = [];
    const arcLengths: number[] = [0];
    let total = 0;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < trace.cells.length; i++) {
      const [cx, cy] = trace.cells[i];
      const px = cx * cellSize + cellSize / 2;
      const py = cy * cellSize + cellSize / 2;
      vertices.push([px, py]);
      if (px < minX) minX = px;
      if (py < minY) minY = py;
      if (px > maxX) maxX = px;
      if (py > maxY) maxY = py;
      if (i > 0) {
        const [ppx, ppy] = vertices[i - 1];
        total += Math.hypot(px - ppx, py - ppy);
        arcLengths.push(total);
      }
    }
    out.push({
      vertices,
      arcLengths,
      totalLength: total,
      excitation: new Float32Array(vertices.length),
      lagArc: 0,
      hasLag: false,
      bboxMinX: minX,
      bboxMinY: minY,
      bboxMaxX: maxX,
      bboxMaxY: maxY,
    });
  }
  return out;
}

export type LightingOptions = {
  color: string;
  lineWidth: number;
  perpFalloff: number;
  sigma: number;
  tau: number;
  chaseTau: number;
  injectRate: number;
};

export function updateLighting(
  traces: TraceDraw[],
  cursor: { x: number; y: number; active: boolean },
  dt: number,
  opts: LightingOptions,
): boolean {
  const { perpFalloff, sigma, tau, chaseTau, injectRate } = opts;
  const decay = Math.exp(-dt / tau);
  const chaseFactor = 1 - Math.exp(-dt / chaseTau);
  const twoSigma2 = 2 * sigma * sigma;
  const stepSize = sigma * 0.5;
  let hasLight = false;

  for (const trace of traces) {
    const e = trace.excitation;
    for (let i = 0; i < e.length; i++) e[i] *= decay;

    let inRange = false;
    if (
      cursor.active &&
      cursor.x >= trace.bboxMinX - perpFalloff &&
      cursor.x <= trace.bboxMaxX + perpFalloff &&
      cursor.y >= trace.bboxMinY - perpFalloff &&
      cursor.y <= trace.bboxMaxY + perpFalloff
    ) {
      const v = trace.vertices;
      let bestSeg = 0;
      let bestT = 0;
      let bestDist2 = Infinity;
      for (let i = 0; i < v.length - 1; i++) {
        const ax = v[i][0];
        const ay = v[i][1];
        const bx = v[i + 1][0];
        const by = v[i + 1][1];
        const dx = bx - ax;
        const dy = by - ay;
        const seg2 = dx * dx + dy * dy;
        if (seg2 === 0) continue;
        let t = ((cursor.x - ax) * dx + (cursor.y - ay) * dy) / seg2;
        if (t < 0) t = 0;
        else if (t > 1) t = 1;
        const fx = ax + t * dx;
        const fy = ay + t * dy;
        const ddx = cursor.x - fx;
        const ddy = cursor.y - fy;
        const d2 = ddx * ddx + ddy * ddy;
        if (d2 < bestDist2) {
          bestDist2 = d2;
          bestSeg = i;
          bestT = t;
        }
      }
      const perpDist = Math.sqrt(bestDist2);
      if (perpDist < perpFalloff) {
        inRange = true;
        const perpInt = 1 - perpDist / perpFalloff;
        const segLen =
          trace.arcLengths[bestSeg + 1] - trace.arcLengths[bestSeg];
        const cursorArc = trace.arcLengths[bestSeg] + bestT * segLen;
        const totalEnergy = perpInt * injectRate * dt;

        let from: number;
        let to: number;
        if (trace.hasLag) {
          from = trace.lagArc;
          trace.lagArc += (cursorArc - trace.lagArc) * chaseFactor;
          to = trace.lagArc;
        } else {
          trace.lagArc = cursorArc;
          trace.hasLag = true;
          from = cursorArc;
          to = cursorArc;
        }

        const span = to - from;
        const absSpan = Math.abs(span);
        const steps = Math.max(1, Math.ceil(absSpan / stepSize));
        const energyPerStep = totalEnergy / steps;
        for (let k = 0; k < steps; k++) {
          const s =
            steps === 1 ? to : from + (span * (k + 0.5)) / steps;
          for (let i = 0; i < e.length; i++) {
            const d = trace.arcLengths[i] - s;
            const g = Math.exp(-(d * d) / twoSigma2);
            const next = e[i] + energyPerStep * g;
            e[i] = next > 1 ? 1 : next;
          }
        }
      }
    }

    if (!inRange) {
      // cursor not in range this frame — keep lagArc so smooth resume on return,
      // but if excitation has fully decayed, clear lag state so next contact snaps.
      let anyLight = false;
      for (let i = 0; i < e.length; i++) {
        if (e[i] > 0.01) {
          anyLight = true;
          break;
        }
      }
      if (!anyLight) trace.hasLag = false;
    }

    if (!hasLight) {
      for (let i = 0; i < e.length; i++) {
        if (e[i] > 0.01) {
          hasLight = true;
          break;
        }
      }
    }
  }

  return hasLight;
}

export function drawLighting(
  ctx: CanvasRenderingContext2D,
  traces: TraceDraw[],
  opts: LightingOptions,
): void {
  const { color, lineWidth } = opts;
  const [r, g, b] = hexToRgb(color);

  const prevComposite = ctx.globalCompositeOperation;
  const prevCap = ctx.lineCap;
  const prevJoin = ctx.lineJoin;
  const prevAlpha = ctx.globalAlpha;
  const prevStroke = ctx.strokeStyle;
  const prevWidth = ctx.lineWidth;

  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.lineWidth = lineWidth * 3;
  for (const trace of traces) {
    strokeTraceGradient(ctx, trace, r, g, b, 0.22);
  }

  ctx.lineWidth = lineWidth;
  for (const trace of traces) {
    strokeTraceGradient(ctx, trace, r, g, b, 0.95);
  }

  ctx.globalCompositeOperation = prevComposite;
  ctx.lineCap = prevCap;
  ctx.lineJoin = prevJoin;
  ctx.globalAlpha = prevAlpha;
  ctx.strokeStyle = prevStroke;
  ctx.lineWidth = prevWidth;
}

function strokeTraceGradient(
  ctx: CanvasRenderingContext2D,
  trace: TraceDraw,
  r: number,
  g: number,
  b: number,
  alphaScale: number,
): void {
  const v = trace.vertices;
  const e = trace.excitation;
  for (let i = 0; i < v.length - 1; i++) {
    const a0 = e[i];
    const a1 = e[i + 1];
    if (a0 < 0.02 && a1 < 0.02) continue;
    const x0 = v[i][0];
    const y0 = v[i][1];
    const x1 = v[i + 1][0];
    const y1 = v[i + 1][1];
    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    grad.addColorStop(0, `rgba(${r},${g},${b},${a0 * alphaScale})`);
    grad.addColorStop(1, `rgba(${r},${g},${b},${a1 * alphaScale})`);
    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }
}

function hexToRgb(hex: string): [number, number, number] {
  let v = hex.replace(/^#/, "");
  if (v.length === 3) v = v[0] + v[0] + v[1] + v[1] + v[2] + v[2];
  const n = parseInt(v, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}
