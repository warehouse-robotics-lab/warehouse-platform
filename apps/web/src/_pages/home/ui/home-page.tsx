import { Button } from "@/shared/ui/button";

export function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16">
      <div className="flex max-w-xl flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Платформа управления складом
        </h1>
        <p className="text-muted-foreground">
          Интерфейс для сборки карты склада, управления роботами и наблюдения за
          симуляцией.
        </p>
      </div>
      <Button type="button">Начать</Button>
    </main>
  );
}
