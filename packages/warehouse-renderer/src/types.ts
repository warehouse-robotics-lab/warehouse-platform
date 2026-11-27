export type WarehouseCanvasProps = {
  gridWidth?: number;
  gridHeight?: number;
};

export type HoveredCell = {
  column: number;
  row: number;
};

export type AxisLabelProps = {
  active: boolean;
  label: number;
};

export type AxisStripProps = {
  count: number;
  activeIndex: number | undefined;
  orientation: "horizontal" | "vertical";
};
