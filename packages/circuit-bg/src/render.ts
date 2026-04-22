import type { CircuitData, Point } from "./types";

export type RenderOptions = {
  cellSize: number;
  color: string;
  backgroundColor: string;
  chipColor?: string;
  lineWidth?: number;
};

export function render(
  ctx: CanvasRenderingContext2D,
  data: CircuitData,
  opts: RenderOptions,
): void {
  const {
    cellSize,
    color,
    backgroundColor,
    lineWidth = 1.3,
    chipColor = backgroundColor,
  } = opts;
  const width = data.cols * cellSize;
  const height = data.rows * cellSize;

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  drawTraces(ctx, data, cellSize, color, lineWidth);
  drawVias(ctx, data, cellSize, color);
  drawPads(ctx, data, cellSize, color, backgroundColor, lineWidth);
  drawChips(ctx, data, cellSize, color, chipColor, lineWidth);
}

function cellCenter(cell: Point, cellSize: number): [number, number] {
  return [cell[0] * cellSize + cellSize / 2, cell[1] * cellSize + cellSize / 2];
}

function drawTraces(
  ctx: CanvasRenderingContext2D,
  data: CircuitData,
  cellSize: number,
  color: string,
  lineWidth: number,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const trace of data.traces) {
    ctx.beginPath();
    for (let i = 0; i < trace.cells.length; i++) {
      const [px, py] = cellCenter(trace.cells[i], cellSize);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
}

function drawVias(
  ctx: CanvasRenderingContext2D,
  data: CircuitData,
  cellSize: number,
  color: string,
) {
  ctx.fillStyle = color;
  for (const via of data.vias) {
    const [px, py] = cellCenter(via.cell, cellSize);
    ctx.beginPath();
    ctx.arc(px, py, via.radius * cellSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPads(
  ctx: CanvasRenderingContext2D,
  data: CircuitData,
  cellSize: number,
  color: string,
  backgroundColor: string,
  lineWidth: number,
) {
  for (const pad of data.pads) {
    const [px, py] = cellCenter(pad.cell, cellSize);
    const r = pad.radius * cellSize;
    if (pad.style === "dot") {
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = backgroundColor;
      ctx.fill();
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = color;
      ctx.stroke();
    }
  }
}

function drawChips(
  ctx: CanvasRenderingContext2D,
  data: CircuitData,
  cellSize: number,
  color: string,
  chipColor: string,
  lineWidth: number,
) {
  const pinLen = cellSize * 0.5;

  for (const chip of data.chips) {
    const bx = chip.x * cellSize;
    const by = chip.y * cellSize;
    const bw = chip.w * cellSize;
    const bh = chip.h * cellSize;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.fillStyle = color;
    for (const pin of chip.pins) {
      const ox = bx + pin.offset * cellSize + cellSize / 2;
      const oy = by + pin.offset * cellSize + cellSize / 2;
      let x1 = 0;
      let y1 = 0;
      let x2 = 0;
      let y2 = 0;
      switch (pin.side) {
        case "left":
          x1 = bx;
          y1 = oy;
          x2 = bx - pinLen;
          y2 = oy;
          break;
        case "right":
          x1 = bx + bw;
          y1 = oy;
          x2 = bx + bw + pinLen;
          y2 = oy;
          break;
        case "top":
          x1 = ox;
          y1 = by;
          x2 = ox;
          y2 = by - pinLen;
          break;
        case "bottom":
          x1 = ox;
          y1 = by + bh;
          x2 = ox;
          y2 = by + bh + pinLen;
          break;
      }
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    ctx.fillStyle = chipColor;
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);

    ctx.beginPath();
    ctx.arc(bx + cellSize * 0.55, by + cellSize * 0.55, cellSize * 0.14, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    const fontSize = Math.max(9, cellSize * 0.55);
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(chip.label, bx + bw / 2, by + bh / 2);
  }
}
