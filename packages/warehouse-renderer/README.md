# Warehouse Renderer

Workspace-пакет `@warehouse/warehouse-renderer`. Библиотека рисует сетку склада для Web через Konva и react-konva — см. [ADR-004](../../docs/adr/004-warehouse-renderer-konva.md).

Публичный компонент — `WarehouseCanvas`. По умолчанию сетка 20×20. Размер клетки задан внутри пакета и наружу не передаётся. Сверху и слева стоят номера столбцов и строк, начиная с 1. При наведении на клетку подсвечиваются номер её столбца, номер её строки и тонкая рамка самой клетки. Объекты карты, выбор клетки и камера в этот пакет пока не входят.

## Подключение

В `package.json` приложения:

```json
{
  "dependencies": {
    "@warehouse/warehouse-renderer": "workspace:*"
  }
}
```

Импорт после сборки пакета:

```tsx
import { WarehouseCanvas } from "@warehouse/warehouse-renderer";

<WarehouseCanvas />
<WarehouseCanvas gridWidth={20} gridHeight={20} />
```

Web показывает этот компонент на `/warehouses/[id]/edit`. Konva нужен браузер, поэтому страница подключает компонент с `ssr: false`.

## Команды

Из корня репозитория:

```sh
pnpm --filter @warehouse/warehouse-renderer build
pnpm --filter @warehouse/warehouse-renderer typecheck
pnpm --filter @warehouse/warehouse-renderer lint
```

`build` пишет JavaScript и объявления типов в `dist/`. Каталог `dist` не коммитится: перед запуском Web его нужно собрать. Корневые `pnpm build`, `pnpm typecheck` и `pnpm dev` делают это через Turbo до задач Web.
