import { WarehouseCanvasView } from "./warehouse-canvas-view";

export async function WarehouseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <h1 className="text-title font-semibold">Редактирование склада {id}</h1>
      <WarehouseCanvasView />
    </div>
  );
}
