# Tasks

[#20](https://github.com/warehouse-robotics-lab/warehouse-platform/issues/20) — небольшой модуль: спецификация и тесты одним ревью, затем реализация ([ADR-002](../../../docs/adr/002-ai-development-workflow.md)). Группу 3 не начинать, пока в журнале нет согласования спецификации и тестов.

Соответствие макету не применяется.

## 1. Спецификация

- [x] 1.1 Спека `specs/warehouse-renderer/spec.md`. Проверка: `pnpm exec openspec validate show-warehouse-objects --strict --no-interactive` проходит.
- [ ] 1.2 Учесть замечания ревью. Проверка: спека обновлена, та же команда проходит.

## 2. Тесты

- [ ] 2.1 Vitest и мок `react-konva` в `packages/warehouse-renderer`. Тесты рядом с холстом на сценарии карты, выбора, режима редактирования, режима симуляции и линии будущего пути. Проверка: `pnpm --filter @warehouse/warehouse-renderer test` запускается и падает на текущей сетке без объектов.
- [ ] 2.2 Записать согласование спеки и тестов в журнал: имя, ссылка, ревизия. Проверка: запись есть.

## 3. Реализация

- [ ] 3.1 Вход `mode`, `map`, `selection`, `onSelect`, `stepIntervalMs`, `route`, текущий отрезок; отрисовка объектов, линии пути и анимации по `design.md`. Проверка: тесты пакета проходят, typecheck пакета проходит.
- [ ] 3.2 README пакета описывает оба режима и props. Проверка: README совпадает с `design.md`.
- [ ] 3.3 Выполнить `test`, `typecheck` и `lint` пакета: `pnpm --filter @warehouse/warehouse-renderer <script>` для каждого. Проверка: команды без ошибок.

## Журнал согласований

Согласование спецификации и тестов: нет.

## Workflow follow-up

- Архив только по явной просьбе.
- Поля снимка не переносить в пакет до [#36](https://github.com/warehouse-robotics-lab/warehouse-platform/issues/36).
