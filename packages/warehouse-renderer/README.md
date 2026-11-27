# Warehouse Renderer

Компонент отрисовки карты, станций, препятствий, роботов и маршрутов для Web.

Для первой версии выбраны Konva и react-konva — см.
[ADR-004](../../docs/adr/004-warehouse-renderer-konva.md).
Компонент получает данные и сообщает о действиях пользователя.
Публичный интерфейс пакета и взаимодействие с Web и Simulation согласуются отдельно.

Имя будущего workspace-пакета — `@warehouse/warehouse-renderer`.
