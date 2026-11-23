import { useState } from "react";
import { Layer, Line, Rect, Stage } from "react-konva";

const CELL_SIZE_PX = 32;
const AXIS_SIZE_PX = 28;
const DEFAULT_GRID_SIZE = 20;
const LABEL_COLOR = "#0f172a";
const LABEL_ACTIVE_COLOR = "#2563eb";

export type WarehouseCanvasProps = {
  gridWidth?: number;
  gridHeight?: number;
};

type HoveredCell = {
  column: number;
  row: number;
};

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

  return (
    <div
      onMouseLeave={() => setHovered(null)}
      style={{
        display: "grid",
        gridTemplateColumns: `${AXIS_SIZE_PX}px ${width}px`,
        gridTemplateRows: `${AXIS_SIZE_PX}px ${height}px`,
        width: AXIS_SIZE_PX + width,
      }}
    >
      <div />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridWidth}, ${CELL_SIZE_PX}px)`,
        }}
      >
        {Array.from({ length: gridWidth }, (_, column) => (
          <AxisLabel
            key={`column-label-${column}`}
            active={hovered?.column === column}
            label={column + 1}
          />
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateRows: `repeat(${gridHeight}, ${CELL_SIZE_PX}px)`,
        }}
      >
        {Array.from({ length: gridHeight }, (_, row) => (
          <AxisLabel
            key={`row-label-${row}`}
            active={hovered?.row === row}
            label={row + 1}
          />
        ))}
      </div>
      <Stage
        width={width}
        height={height}
        onMouseLeave={() => setHovered(null)}
        onMouseMove={(event) => {
          const position = event.target.getStage()?.getPointerPosition();
          if (!position) {
            return;
          }
          const column = Math.floor(position.x / CELL_SIZE_PX);
          const row = Math.floor(position.y / CELL_SIZE_PX);
          if (
            column < 0 ||
            row < 0 ||
            column >= gridWidth ||
            row >= gridHeight
          ) {
            setHovered(null);
            return;
          }
          hoverCell(column, row);
        }}
      >
        <Layer>
          <Rect width={width} height={height} fill="#f8fafc" />
          {Array.from({ length: gridWidth + 1 }, (_, index) => (
            <Line
              key={`column-${index}`}
              points={[index * CELL_SIZE_PX, 0, index * CELL_SIZE_PX, height]}
              stroke="#cbd5e1"
              strokeWidth={1}
            />
          ))}
          {Array.from({ length: gridHeight + 1 }, (_, index) => (
            <Line
              key={`row-${index}`}
              points={[0, index * CELL_SIZE_PX, width, index * CELL_SIZE_PX]}
              stroke="#cbd5e1"
              strokeWidth={1}
            />
          ))}
          {hovered ? (
            <Rect
              x={hovered.column * CELL_SIZE_PX + 0.5}
              y={hovered.row * CELL_SIZE_PX + 0.5}
              width={CELL_SIZE_PX - 1}
              height={CELL_SIZE_PX - 1}
              stroke={LABEL_ACTIVE_COLOR}
              strokeWidth={1}
              listening={false}
            />
          ) : null}
        </Layer>
      </Stage>
    </div>
  );
}

function AxisLabel({ active, label }: { active: boolean; label: number }) {
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: active ? LABEL_ACTIVE_COLOR : LABEL_COLOR,
        fontSize: 12,
        fontWeight: active ? 600 : 400,
        lineHeight: 1,
        userSelect: "none",
      }}
    >
      {label}
    </span>
  );
}
