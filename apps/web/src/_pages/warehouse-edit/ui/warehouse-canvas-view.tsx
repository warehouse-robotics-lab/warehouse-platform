"use client";

import dynamic from "next/dynamic";

const AXIS_SIZE_PX = 28;
const GRID_SIZE_PX = 640;

const WarehouseCanvas = dynamic(
  () =>
    import("@warehouse/warehouse-renderer").then(
      (module) => module.WarehouseCanvas,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden
        className="bg-muted"
        style={{
          width: AXIS_SIZE_PX + GRID_SIZE_PX,
          height: AXIS_SIZE_PX + GRID_SIZE_PX,
        }}
      />
    ),
  },
);

export function WarehouseCanvasView() {
  return (
    <div className="max-w-full min-w-0 overflow-x-auto">
      <WarehouseCanvas />
    </div>
  );
}
