# Warehouse Platform

Платформа управления роботами на симулируемом складе.

Спецификации поведения ведём в `openspec/`. Этапы человеческого согласования
описаны в [ADR-002](docs/adr/002-ai-development-workflow.md).

## Окружение

- Node.js 24.22.2 — версия указана в `.nvmrc`.
- pnpm 11.1.1 — версия указана в `packageManager`.
- Turborepo 2.11.10 — локальная зависимость проекта.

```sh
nvm install
nvm use
npm install --global pnpm@11.1.1
pnpm install
```

Если pnpm уже установлен в указанной версии, повторная установка не нужна. При использовании другого менеджера Node.js выберите версию из `.nvmrc`.

## Структура

```text
apps/
  web/                 # Next.js: интерфейс приложения
  api/                 # NestJS: API, доступ и данные
  simulation/          # Node.js: исполнение симуляции
packages/
  contracts/           # Общие контракты — инструмент обсуждается
  warehouse-renderer/  # Компонент карты — библиотека обсуждается
docs/
  adr/                 # Архитектурные решения и их статус
```

`apps/web`, `apps/api` и `apps/simulation` инициализированы. Simulation пока содержит только запускаемую основу без расчётов и внешних подключений.

## Команды

```sh
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
```

Turbo запускает соответствующие скрипты из `package.json` workspace-пакетов.
`dev`, `build`, `typecheck` и `lint` выполняют задачи Web и Simulation.
У `test` пока нет реализованных скриптов.

## Спецификации OpenSpec

Проект использует локальный CLI OpenSpec из devDependencies:

```sh
pnpm exec openspec list --json
pnpm exec openspec show <change-id> --json
pnpm exec openspec validate <change-id> --strict --no-interactive
```

Текущее поведение описывается в `openspec/specs/`, дельты — в
`openspec/changes/<change-id>/`, завершённые изменения — в `openspec/changes/archive/`.
Контекст проекта и правила этапов — в `openspec/config.yaml`. Готовность артефактов
не заменяет человеческие согласования из ADR-002. Личные настройки AI-клиентов
хранятся вне версионируемых файлов проекта.

Turbo запускает соответствующие скрипты из package.json workspace-пакетов. dev, build, typecheck и lint выполняют задачи Web и Simulation. У test пока нет реализованных скриптов.


## Подключение приложения или пакета

1. Создайте `package.json` в соответствующем каталоге с уникальным именем `@warehouse/*` и `private: true`.
2. Добавьте скрипты `dev`, `build`, `lint`, `typecheck`, `test` по мере появления реальных инструментов. Скрипты-заглушки не нужны.
3. Общие пакеты подключайте через `workspace:*`.
4. Выполните `pnpm install` из корня и включите изменение `pnpm-lock.yaml` в свою работу.
5. Обновите README приложения с командами запуска и переменными окружения.

Для команды одного приложения после его инициализации используйте, например, `pnpm --filter @warehouse/web dev`.

Корневой `turbo.json` задаёт порядок задач и общие выходные каталоги. При появлении других артефактов сборки или переменных окружения настройте их кеширование в рамках соответствующей задачи.

## Форматирование и pre-commit

Prettier настроен в корне. Перед коммитом Husky запускает `lint-staged` и форматирует индексированные файлы.

```sh
pnpm format
pnpm format:check
```

## Коммиты и PR

Используем Conventional Commits: `type(scope): description`, scope необязателен.
Основные типы: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `build`.
Scope указывает часть проекта, например `web`, `api`, `simulation` или `root`.
Описание — на английском, в повелительной форме, без точки в конце.

Примеры: `feat(web): add warehouse list`, `docs: define AI development workflow`.
Заголовок PR оформляется так же, поскольку используется при squash merge.
