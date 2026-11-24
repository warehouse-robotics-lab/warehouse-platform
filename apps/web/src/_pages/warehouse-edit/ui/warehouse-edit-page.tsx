import { WarehouseCanvasView } from "./warehouse-canvas-view";

export function WarehouseEditPage() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 md:gap-6">
      <h1 className="text-title font-semibold">Редактирование склада demo</h1>
      <WarehouseCanvasView />
    </div>
  );
}
