import { mulberry32, type Rng } from "./rng";
import type {
  Chip,
  CircuitData,
  Pad,
  Pin,
  Point,
  Trace,
  Via,
} from "./types";

export type GenerateOptions = {
  cols: number;
  rows: number;
  seed?: number;
  density?: number;
  chipDensity?: number;
};

const EMPTY = 0;
const TRACE = 1;
const CHIP = 2;
const PIN = 3;

const DIRS: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];

const CHIP_PREFIXES = ["U", "IC", "Q", "A", "M"] as const;

type Connection = "pin" | "trace" | null;

type WalkResult = {
  cells: Point[];
  startConnected: Connection;
  endConnected: Connection;
};

type PinSeed = { cell: Point; dir: number };

export function generate(opts: GenerateOptions): CircuitData {
  const { cols, rows } = opts;
  const density = opts.density ?? 0.58;
  const chipDensity = opts.chipDensity ?? 900;
  const rng = mulberry32(opts.seed ?? Math.floor(Math.random() * 0x7fffffff));

  const grid = new Uint8Array(cols * rows);
  const noPadMask = new Uint8Array(cols * rows);
  const padMask = new Uint8Array(cols * rows);
  const idx = (x: number, y: number) => y * cols + x;
  const inBounds = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < cols && y < rows;

  const { chips, pinSeeds } = placeChips(
    grid,
    noPadMask,
    cols,
    rows,
    chipDensity,
    rng,
    idx,
    inBounds,
  );

  const traces: Trace[] = [];
  const pads: Pad[] = [];
  const vias: Via[] = [];

  let occupied = 0;
  for (let i = 0; i < cols * rows; i++) if (grid[i] !== EMPTY) occupied++;

  type StepResult =
    | { kind: "stepped"; cell: Point }
    | { kind: "connected"; via: "pin" | "trace"; cell: Point }
    | { kind: "blocked" };

  function tryStep(
    cells: Point[],
    cx: number,
    cy: number,
    d: number,
  ): StepResult {
    const nx = cx + DIRS[d][0];
    const ny = cy + DIRS[d][1];
    if (!inBounds(nx, ny)) return { kind: "blocked" };
    const v = grid[idx(nx, ny)];
    if (v === EMPTY) {
      cells.push([nx, ny]);
      grid[idx(nx, ny)] = TRACE;
      occupied++;
      return { kind: "stepped", cell: [nx, ny] };
    }
    if (v === PIN || v === TRACE) {
      const first = cells[0];
      if (first[0] === nx && first[1] === ny) return { kind: "blocked" };
      if (cells.length >= 2) {
        const prev = cells[cells.length - 2];
        if (prev[0] === nx && prev[1] === ny) return { kind: "blocked" };
      }
      return {
        kind: "connected",
        via: v === PIN ? "pin" : "trace",
        cell: [nx, ny],
      };
    }
    return { kind: "blocked" };
  }

  function walk(
    start: Point,
    startKind: "pin" | "trace" | "empty",
    forcedDir: number | null,
  ): WalkResult | null {
    const [sx, sy] = start;
    if (startKind === "empty" && grid[idx(sx, sy)] !== EMPTY) return null;

    const cells: Point[] = [[sx, sy]];
    if (startKind === "empty") {
      grid[idx(sx, sy)] = TRACE;
      occupied++;
    }
    const startConnected: Connection =
      startKind === "empty" ? null : startKind;

    let cx = sx;
    let cy = sy;
    let dir = forcedDir ?? Math.floor(rng() * 4);
    const maxLen = 10 + Math.floor(rng() * 30);
    let endConnected: Connection = null;

    for (let step = 0; step < maxLen; step++) {
      if (step > 0 && rng() < 0.18) {
        dir = (dir + (rng() < 0.5 ? 1 : 3)) % 4;
      }
      let result = tryStep(cells, cx, cy, dir);
      if (result.kind === "blocked") {
        const alt1 = (dir + 1) % 4;
        const alt2 = (dir + 3) % 4;
        const order = rng() < 0.5 ? [alt1, alt2] : [alt2, alt1];
        result = { kind: "blocked" };
        for (const d of order) {
          const alt = tryStep(cells, cx, cy, d);
          if (alt.kind !== "blocked") {
            dir = d;
            result = alt;
            break;
          }
        }
      }
      if (result.kind === "stepped") {
        cx = result.cell[0];
        cy = result.cell[1];
        continue;
      }
      if (result.kind === "connected") {
        cells.push(result.cell);
        endConnected = result.via;
        break;
      }
      break;
    }

    if (!endConnected) {
      const prev = cells.length >= 2 ? cells[cells.length - 2] : null;
      for (const d of DIRS) {
        const tx = cx + d[0];
        const ty = cy + d[1];
        if (!inBounds(tx, ty)) continue;
        if (prev && prev[0] === tx && prev[1] === ty) continue;
        if (tx === cells[0][0] && ty === cells[0][1]) continue;
        const tv = grid[idx(tx, ty)];
        if (tv === PIN || tv === TRACE) {
          cells.push([tx, ty]);
          endConnected = tv === PIN ? "pin" : "trace";
          break;
        }
      }
    }

    if (cells.length < 2) return null;
    return { cells, startConnected, endConnected };
  }

  function placePadMaybe(cell: Point, neighborOnTrace: Point): void {
    const [ex, ey] = cell;
    const i = idx(ex, ey);
    if (noPadMask[i]) return;
    for (const d of DIRS) {
      const nx = ex + d[0];
      const ny = ey + d[1];
      if (!inBounds(nx, ny)) continue;
      if (nx === neighborOnTrace[0] && ny === neighborOnTrace[1]) continue;
      if (padMask[idx(nx, ny)]) return;
    }
    padMask[i] = 1;
    pads.push(makePad(cell, rng));
  }

  function commitWalk(w: WalkResult): void {
    traces.push({ cells: w.cells });
    const start = w.cells[0];
    const end = w.cells[w.cells.length - 1];
    const nextFromStart = w.cells[1];
    const nextFromEnd = w.cells[w.cells.length - 2];

    if (w.startConnected === "trace") {
      vias.push({ cell: start, radius: 0.22 + rng() * 0.06 });
    } else if (w.startConnected === null) {
      placePadMaybe(start, nextFromStart);
    }

    if (w.endConnected === "trace") {
      vias.push({ cell: end, radius: 0.22 + rng() * 0.06 });
    } else if (w.endConnected === null) {
      placePadMaybe(end, nextFromEnd);
    }
  }

  for (const seed of pinSeeds) {
    const w = walk(seed.cell, "pin", seed.dir);
    if (w) commitWalk(w);
  }

  const total = cols * rows;
  const target = total * density;
  const maxAttempts = 30000;
  let attempts = 0;

  while (occupied < target && attempts < maxAttempts) {
    attempts++;
    let walked: WalkResult | null = null;

    if (rng() < 0.45 && traces.length > 0) {
      const t = traces[Math.floor(rng() * traces.length)];
      if (t.cells.length >= 4) {
        const mi = 1 + Math.floor(rng() * (t.cells.length - 2));
        const start = t.cells[mi];
        if (grid[idx(start[0], start[1])] === TRACE) {
          const dirs: number[] = [0, 1, 2, 3];
          for (let i = dirs.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
          }
          for (const d of dirs) {
            const nx = start[0] + DIRS[d][0];
            const ny = start[1] + DIRS[d][1];
            if (inBounds(nx, ny) && grid[idx(nx, ny)] === EMPTY) {
              walked = walk(start, "trace", d);
              if (walked) break;
            }
          }
        }
      }
    }

    if (!walked) {
      const sx = Math.floor(rng() * cols);
      const sy = Math.floor(rng() * rows);
      if (grid[idx(sx, sy)] !== EMPTY) continue;
      walked = walk([sx, sy], "empty", null);
    }

    if (walked) commitWalk(walked);
  }

  return { cols, rows, traces, chips, pads, vias };
}

function placeChips(
  grid: Uint8Array,
  noPadMask: Uint8Array,
  cols: number,
  rows: number,
  chipDensity: number,
  rng: Rng,
  idx: (x: number, y: number) => number,
  inBounds: (x: number, y: number) => boolean,
): { chips: Chip[]; pinSeeds: PinSeed[] } {
  const chips: Chip[] = [];
  const pinSeeds: PinSeed[] = [];
  const targetCount = Math.max(1, Math.floor((cols * rows) / chipDensity));

  for (let i = 0; i < targetCount; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const w = 4 + Math.floor(rng() * 6);
      const h = 4 + Math.floor(rng() * 8);
      if (cols - w - 4 < 2 || rows - h - 4 < 2) break;
      const x = 2 + Math.floor(rng() * (cols - w - 4));
      const y = 2 + Math.floor(rng() * (rows - h - 4));

      let clear = true;
      for (let dy = -1; dy <= h && clear; dy++) {
        for (let dx = -1; dx <= w && clear; dx++) {
          if (grid[idx(x + dx, y + dy)] !== EMPTY) clear = false;
        }
      }
      if (!clear) continue;

      for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) grid[idx(x + dx, y + dy)] = CHIP;
      }
      for (let dy = -1; dy <= h; dy++) {
        for (let dx = -1; dx <= w; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (inBounds(nx, ny)) noPadMask[idx(nx, ny)] = 1;
        }
      }

      const rawPins: Pin[] = [];
      const quad = rng() < 0.5;
      for (let p = 1; p < h - 1; p += 2) {
        rawPins.push({ side: "left", offset: p });
        rawPins.push({ side: "right", offset: p });
      }
      if (quad) {
        for (let p = 1; p < w - 1; p += 2) {
          rawPins.push({ side: "top", offset: p });
          rawPins.push({ side: "bottom", offset: p });
        }
      }

      const pins: Pin[] = [];
      for (const pin of rawPins) {
        const seed = pinSeedFor(x, y, w, h, pin);
        if (!inBounds(seed.cell[0], seed.cell[1])) continue;
        const ti = idx(seed.cell[0], seed.cell[1]);
        if (grid[ti] !== EMPTY) continue;
        grid[ti] = PIN;
        noPadMask[ti] = 1;
        pins.push(pin);
        pinSeeds.push(seed);
      }

      const prefix = CHIP_PREFIXES[Math.floor(rng() * CHIP_PREFIXES.length)];
      const label = `${prefix}${Math.floor(rng() * 99) + 1}`;
      chips.push({ x, y, w, h, pins, label });
      break;
    }
  }
  return { chips, pinSeeds };
}

function pinSeedFor(
  cx: number,
  cy: number,
  cw: number,
  ch: number,
  pin: Pin,
): PinSeed {
  switch (pin.side) {
    case "left":
      return { cell: [cx - 1, cy + pin.offset], dir: 2 };
    case "right":
      return { cell: [cx + cw, cy + pin.offset], dir: 0 };
    case "top":
      return { cell: [cx + pin.offset, cy - 1], dir: 3 };
    case "bottom":
      return { cell: [cx + pin.offset, cy + ch], dir: 1 };
  }
}

function makePad(cell: Point, rng: Rng): Pad {
  const style = rng() < 0.55 ? "ring" : "dot";
  const radius = style === "ring" ? 0.28 + rng() * 0.1 : 0.16 + rng() * 0.08;
  return { cell, style, radius };
}
