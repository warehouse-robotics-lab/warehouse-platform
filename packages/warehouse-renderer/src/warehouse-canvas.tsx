import type { KonvaEventObject } from "konva/lib/Node";
import { useState } from "react";
import { Layer, Line, Rect, Stage } from "react-konva";
import { AxisStrip } from "./components/axis-strip.js";
import {
  AXIS_SIZE_PX,
  CELL_SIZE_PX,
  DEFAULT_GRID_SIZE,
  GRID_BACKGROUND_COLOR,
  GRID_LINE_COLOR,
  GRID_LINE_WIDTH,
  LABEL_ACTIVE_COLOR,
} from "./consts.js";
import type { HoveredCell, WarehouseCanvasProps } from "./types.js";

export type { WarehouseCanvasProps } from "./types.js";

export function WarehouseCanvas({
  gridWidth = DEFAULT_GRID_SIZE,
  gridHeight = DEFAULT_GRID_SIZE,
}: WarehouseCanvasProps) {
  const [hovered, setHovered] = useState<HoveredCell | null>(null);
  const width = gridWidth * CELL_SIZE_PX;
  const height = gridHeight * CELL_SIZE_PX;

  function hoverCell(column: number, row: number) {
    setHovered((current) => {
      if (current?.column === column && current.row === row) {
        return current;
      }
      return { column, row };
    });
  }

  function clearHover() {
    setHovered(null);
  }

  function handleStageMouseMove(event: KonvaEventObject<MouseEvent>) {
    const position = event.target.getStage()?.getPointerPosition();
    if (!position) {
      return;
    }
    const column = Math.floor(position.x / CELL_SIZE_PX);
    const row = Math.floor(position.y / CELL_SIZE_PX);
    if (column < 0 || row < 0 || column >= gridWidth || row >= gridHeight) {
      clearHover();
      return;
    }
    hoverCell(column, row);
  }

  return (
    <div
      onMouseLeave={clearHover}
      style={{
        display: "grid",
        gridTemplateColumns: `${AXIS_SIZE_PX}px ${width}px`,
        gridTemplateRows: `${AXIS_SIZE_PX}px ${height}px`,
        width: AXIS_SIZE_PX + width,
      }}
    >
      <div />
      <AxisStrip
        count={gridWidth}
        activeIndex={hovered?.column}
        orientation="horizontal"
      />
      <AxisStrip
        count={gridHeight}
        activeIndex={hovered?.row}
        orientation="vertical"
      />
      <Stage
        width={width}
        height={height}
        onMouseLeave={clearHover}
        onMouseMove={handleStageMouseMove}
      >
        <Layer>
          <Rect width={width} height={height} fill={GRID_BACKGROUND_COLOR} />
          {Array.from({ length: gridWidth + 1 }, (_, index) => (
            <Line
              key={`column-${index}`}
              points={[index * CELL_SIZE_PX, 0, index * CELL_SIZE_PX, height]}
              stroke={GRID_LINE_COLOR}
              strokeWidth={GRID_LINE_WIDTH}
            />
          ))}
          {Array.from({ length: gridHeight + 1 }, (_, index) => (
            <Line
              key={`row-${index}`}
              points={[0, index * CELL_SIZE_PX, width, index * CELL_SIZE_PX]}
              stroke={GRID_LINE_COLOR}
              strokeWidth={GRID_LINE_WIDTH}
            />
          ))}
          {hovered ? (
            <Rect
              x={hovered.column * CELL_SIZE_PX + 0.5}
              y={hovered.row * CELL_SIZE_PX + 0.5}
              width={CELL_SIZE_PX - 1}
              height={CELL_SIZE_PX - 1}
              stroke={LABEL_ACTIVE_COLOR}
              strokeWidth={GRID_LINE_WIDTH}
              listening={false}
            />
          ) : null}
        </Layer>
      </Stage>
    </div>
  );
}
