import type { Chip, CircuitData, PadStyle } from "./types";

type Graph = {
  x: Float32Array;
  y: Float32Array;
  neighbors: number[][];
  nodeCount: number;
};

type SceneTrace = {
  nodeIds: number[];
  vertices: Array<[number, number]>;
  bboxMinX: number;
  bboxMinY: number;
  bboxMaxX: number;
  bboxMaxY: number;
};

type ScenePad = {
  nodeId: number;
  x: number;
  y: number;
  style: PadStyle;
  pixelRadius: number;
};

type SceneVia = {
  nodeId: number;
  x: number;
  y: number;
  pixelRadius: number;
};

type SceneChip = {
  chip: Chip;
  pinNodeIds: number[];
  bx: number;
  by: number;
  bw: number;
  bh: number;
};

export type Scene = {
  graph: Graph;
  cellSize: number;
  traces: SceneTrace[];
  pads: ScenePad[];
  vias: SceneVia[];
  chips: SceneChip[];
};

type Pulse = {
  startTime: number;
  hops: Int32Array;
  maxHops: number;
};

export type LightingState = {
  scene: Scene;
  pulses: Pulse[];
  luminance: Float32Array;
  lastEmitTime: number;
};

export type LightingOptions = {
  color: string;
  lineWidth: number;
  cursorRadius: number;
  emitInterval: number;
  pulseSpeed: number;
  maxPulseHops: number;
  pulseThickness: number;
  pulseLife: number;
  fadeTau: number;
};

export function precomputeScene(
  data: CircuitData,
  cellSize: number,
): Scene {
  const cellToNode = new Map<number, number>();
  const xs: number[] = [];
  const ys: number[] = [];
  const neighbors: number[][] = [];

  const keyFor = (cx: number, cy: number) => cy * 100003 + cx;

  const ensureNode = (cx: number, cy: number): number => {
    const key = keyFor(cx, cy);
    const existing = cellToNode.get(key);
    if (existing !== undefined) return existing;
    const id = xs.length;
    xs.push(cx * cellSize + cellSize / 2);
    ys.push(cy * cellSize + cellSize / 2);
    neighbors.push([]);
    cellToNode.set(key, id);
    return id;
  };

  const addEdge = (a: number, b: number) => {
    if (a === b) return;
    const na = neighbors[a];
    if (na.indexOf(b) === -1) na.push(b);
    const nb = neighbors[b];
    if (nb.indexOf(a) === -1) nb.push(a);
  };

  const traces: SceneTrace[] = [];
  for (const trace of data.traces) {
    const nodeIds: number[] = [];
    const vertices: Array<[number, number]> = [];
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const [cx, cy] of trace.cells) {
      const id = ensureNode(cx, cy);
      nodeIds.push(id);
      const x = xs[id];
      const y = ys[id];
      vertices.push([x, y]);
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
    for (let i = 0; i < nodeIds.length - 1; i++) {
      addEdge(nodeIds[i], nodeIds[i + 1]);
    }
    traces.push({
      nodeIds,
      vertices,
      bboxMinX: minX,
      bboxMinY: minY,
      bboxMaxX: maxX,
      bboxMaxY: maxY,
    });
  }

  const pads: ScenePad[] = data.pads.map((pad) => {
    const id = ensureNode(pad.cell[0], pad.cell[1]);
    return {
      nodeId: id,
      x: xs[id],
      y: ys[id],
      style: pad.style,
      pixelRadius: pad.radius * cellSize,
    };
  });

  const vias: SceneVia[] = data.vias.map((via) => {
    const id = ensureNode(via.cell[0], via.cell[1]);
    return {
      nodeId: id,
      x: xs[id],
      y: ys[id],
      pixelRadius: via.radius * cellSize,
    };
  });

  const chips: SceneChip[] = data.chips.map((chip) => {
    const pinNodeIds: number[] = [];
    for (const pin of chip.pins) {
      let tcx: number;
      let tcy: number;
      switch (pin.side) {
        case "left":
          tcx = chip.x - 1;
          tcy = chip.y + pin.offset;
          break;
        case "right":
          tcx = chip.x + chip.w;
          tcy = chip.y + pin.offset;
          break;
        case "top":
          tcx = chip.x + pin.offset;
          tcy = chip.y - 1;
          break;
        case "bottom":
          tcx = chip.x + pin.offset;
          tcy = chip.y + chip.h;
          break;
      }
      const id = cellToNode.get(keyFor(tcx, tcy));
      pinNodeIds.push(id ?? -1);
    }
    return {
      chip,
      pinNodeIds,
      bx: chip.x * cellSize,
      by: chip.y * cellSize,
      bw: chip.w * cellSize,
      bh: chip.h * cellSize,
    };
  });

  return {
    graph: {
      x: new Float32Array(xs),
      y: new Float32Array(ys),
      neighbors,
      nodeCount: xs.length,
    },
    cellSize,
    traces,
    pads,
    vias,
    chips,
  };
}

export function createLightingState(scene: Scene): LightingState {
  return {
    scene,
    pulses: [],
    luminance: new Float32Array(scene.graph.nodeCount),
    lastEmitTime: -Infinity,
  };
}

function bfsHops(
  graph: Graph,
  sourceId: number,
  maxHops: number,
): Int32Array {
  const hops = new Int32Array(graph.nodeCount);
  hops.fill(-1);
  hops[sourceId] = 0;
  const queue: number[] = [sourceId];
  let head = 0;
  while (head < queue.length) {
    const u = queue[head++];
    const h = hops[u];
    if (h >= maxHops) continue;
    const nbrs = graph.neighbors[u];
    for (let i = 0; i < nbrs.length; i++) {
      const v = nbrs[i];
      if (hops[v] === -1) {
        hops[v] = h + 1;
        queue.push(v);
      }
    }
  }
  return hops;
}

function nearestNode(
  graph: Graph,
  cx: number,
  cy: number,
  maxDist2: number,
): number {
  let bestId = -1;
  let bestD2 = maxDist2;
  const n = graph.nodeCount;
  const gx = graph.x;
  const gy = graph.y;
  for (let i = 0; i < n; i++) {
    const dx = cx - gx[i];
    const dy = cy - gy[i];
    const d2 = dx * dx + dy * dy;
    if (d2 < bestD2) {
      bestD2 = d2;
      bestId = i;
    }
  }
  return bestId;
}

export function updateLighting(
  state: LightingState,
  cursor: { x: number; y: number; active: boolean },
  now: number,
  opts: LightingOptions,
): boolean {
  const graph = state.scene.graph;
  const lum = state.luminance;
  lum.fill(0);

  if (cursor.active) {
    if (now - state.lastEmitTime >= opts.emitInterval) {
      const srcId = nearestNode(
        graph,
        cursor.x,
        cursor.y,
        opts.cursorRadius * opts.cursorRadius * 9,
      );
      if (srcId !== -1) {
        const hops = bfsHops(graph, srcId, opts.maxPulseHops);
        state.pulses.push({
          startTime: now,
          hops,
          maxHops: opts.maxPulseHops,
        });
        state.lastEmitTime = now;
      }
    }

    const r2 = opts.cursorRadius * opts.cursorRadius;
    const gx = graph.x;
    const gy = graph.y;
    for (let i = 0; i < graph.nodeCount; i++) {
      const dx = cursor.x - gx[i];
      const dy = cursor.y - gy[i];
      if (dx * dx + dy * dy < r2) lum[i] = 1;
    }
  }

  const survivors: Pulse[] = [];
  const ramp = Math.max(0.0001, opts.pulseThickness);
  const MAX_PULSES = 32;
  while (state.pulses.length > MAX_PULSES) state.pulses.shift();
  const fadeStart =
    (opts.maxPulseHops + opts.pulseThickness) / Math.max(1, opts.pulseSpeed) +
    opts.emitInterval * 2;
  const fadeTau = Math.max(0.0001, opts.fadeTau);
  for (const pulse of state.pulses) {
    const age = now - pulse.startTime;
    if (age > opts.pulseLife) continue;
    const extraAge = age - fadeStart;
    const timeFade = extraAge <= 0 ? 1 : Math.exp(-extraAge / fadeTau);
    if (timeFade < 0.01) continue;
    const lead = age * opts.pulseSpeed;
    survivors.push(pulse);
    const hops = pulse.hops;
    const maxH = pulse.maxHops > 0 ? pulse.maxHops : 1;
    const n = graph.nodeCount;
    for (let i = 0; i < n; i++) {
      const h = hops[i];
      if (h < 0) continue;
      if (h > lead) continue;
      let reach = (lead - h) / ramp;
      if (reach > 1) reach = 1;
      if (reach <= 0) continue;
      const hopsBright = 1 - h / maxH;
      if (hopsBright <= 0) continue;
      const brightness = hopsBright * reach * timeFade;
      if (brightness > lum[i]) lum[i] = brightness;
    }
  }
  state.pulses = survivors;

  return cursor.active || survivors.length > 0;
}

export function drawLighting(
  ctx: CanvasRenderingContext2D,
  state: LightingState,
  opts: LightingOptions,
): void {
  const { color, lineWidth } = opts;
  const { scene, luminance: lum } = state;
  const cellSize = scene.cellSize;
  const [r, g, b] = hexToRgb(color);
  const colorSolid = `rgb(${r},${g},${b})`;

  const prevComposite = ctx.globalCompositeOperation;
  const prevCap = ctx.lineCap;
  const prevJoin = ctx.lineJoin;
  const prevAlpha = ctx.globalAlpha;
  const prevStroke = ctx.strokeStyle;
  const prevFill = ctx.fillStyle;
  const prevWidth = ctx.lineWidth;
  const prevFont = ctx.font;
  const prevAlign = ctx.textAlign;
  const prevBaseline = ctx.textBaseline;

  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = 1;

  ctx.lineWidth = lineWidth * 3;
  for (const trace of scene.traces) {
    strokeTraceGradient(ctx, trace, lum, r, g, b, 0.22);
  }

  ctx.lineWidth = lineWidth;
  for (const trace of scene.traces) {
    strokeTraceGradient(ctx, trace, lum, r, g, b, 1);
  }

  ctx.strokeStyle = colorSolid;
  ctx.fillStyle = colorSolid;

  for (const pad of scene.pads) {
    const a = lum[pad.nodeId];
    if (a < 0.02) continue;
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.arc(pad.x, pad.y, pad.pixelRadius, 0, Math.PI * 2);
    if (pad.style === "dot") {
      ctx.fill();
    } else {
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }

  for (const via of scene.vias) {
    const a = lum[via.nodeId];
    if (a < 0.02) continue;
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.arc(via.x, via.y, via.pixelRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  const pinLen = cellSize * 0.5;
  ctx.lineWidth = lineWidth;
  for (const sc of scene.chips) {
    let maxPinLum = 0;
    const pins = sc.chip.pins;
    for (let p = 0; p < pins.length; p++) {
      const nid = sc.pinNodeIds[p];
      if (nid < 0) continue;
      const a = lum[nid];
      if (a > maxPinLum) maxPinLum = a;
      if (a < 0.02) continue;
      ctx.globalAlpha = a;
      const pin = pins[p];
      const ox = sc.bx + pin.offset * cellSize + cellSize / 2;
      const oy = sc.by + pin.offset * cellSize + cellSize / 2;
      let x1 = 0;
      let y1 = 0;
      let x2 = 0;
      let y2 = 0;
      switch (pin.side) {
        case "left":
          x1 = sc.bx;
          y1 = oy;
          x2 = sc.bx - pinLen;
          y2 = oy;
          break;
        case "right":
          x1 = sc.bx + sc.bw;
          y1 = oy;
          x2 = sc.bx + sc.bw + pinLen;
          y2 = oy;
          break;
        case "top":
          x1 = ox;
          y1 = sc.by;
          x2 = ox;
          y2 = sc.by - pinLen;
          break;
        case "bottom":
          x1 = ox;
          y1 = sc.by + sc.bh;
          x2 = ox;
          y2 = sc.by + sc.bh + pinLen;
          break;
      }
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    if (maxPinLum >= 0.02) {
      ctx.globalAlpha = maxPinLum;
      ctx.strokeRect(sc.bx + 0.5, sc.by + 0.5, sc.bw - 1, sc.bh - 1);
      ctx.beginPath();
      ctx.arc(
        sc.bx + cellSize * 0.55,
        sc.by + cellSize * 0.55,
        cellSize * 0.14,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      const fontSize = Math.max(9, cellSize * 0.55);
      ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(sc.chip.label, sc.bx + sc.bw / 2, sc.by + sc.bh / 2);
    }
  }

  ctx.globalCompositeOperation = prevComposite;
  ctx.lineCap = prevCap;
  ctx.lineJoin = prevJoin;
  ctx.globalAlpha = prevAlpha;
  ctx.strokeStyle = prevStroke;
  ctx.fillStyle = prevFill;
  ctx.lineWidth = prevWidth;
  ctx.font = prevFont;
  ctx.textAlign = prevAlign;
  ctx.textBaseline = prevBaseline;
}

function strokeTraceGradient(
  ctx: CanvasRenderingContext2D,
  trace: SceneTrace,
  lum: Float32Array,
  r: number,
  g: number,
  b: number,
  alphaScale: number,
): void {
  const v = trace.vertices;
  const ids = trace.nodeIds;
  for (let i = 0; i < v.length - 1; i++) {
    const a0 = lum[ids[i]];
    const a1 = lum[ids[i + 1]];
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
