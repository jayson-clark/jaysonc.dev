export type Point = readonly [number, number];

export type Trace = {
  cells: Point[];
};

export type PinSide = "top" | "right" | "bottom" | "left";

export type Pin = {
  side: PinSide;
  offset: number;
};

export type Chip = {
  x: number;
  y: number;
  w: number;
  h: number;
  pins: Pin[];
  label: string;
};

export type PadStyle = "ring" | "dot";

export type Pad = {
  cell: Point;
  style: PadStyle;
  radius: number;
};

export type Via = {
  cell: Point;
  radius: number;
};

export type CircuitData = {
  cols: number;
  rows: number;
  traces: Trace[];
  chips: Chip[];
  pads: Pad[];
  vias: Via[];
};
