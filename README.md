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

## Локальная PostgreSQL

Для запуска требуется Docker Compose v2. Создайте личный файл настроек из
шаблона — `.env` не попадает в Git:

```sh
cp .env.example .env
```

Запустите PostgreSQL и дождитесь завершения проверки готовности:

```sh
docker compose up -d --wait
```

Убедитесь, что в столбце `STATUS` сервиса `postgres` указано `healthy`:

```sh
docker compose ps
```

Проверьте подключение SQL-запросом. Команда использует имя базы и пользователя
из переменных внутри контейнера:

```sh
docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 1 AS ready;"'
```

Запрос должен вернуть одну строку со значением `1` в столбце `ready`.

### Проверка сохранности данных

Создайте контрольную таблицу и запись:

```sh
docker compose exec -T postgres sh -c \
  "psql -U \"\$POSTGRES_USER\" -d \"\$POSTGRES_DB\" -c \"CREATE TABLE IF NOT EXISTS local_db_check (id integer PRIMARY KEY, note text NOT NULL); INSERT INTO local_db_check (id, note) VALUES (1, 'persisted') ON CONFLICT (id) DO UPDATE SET note = EXCLUDED.note;\""
```

Остановите сервис без удаления Docker volume, затем запустите его снова:

```sh
docker compose down
docker compose up -d --wait
```

Убедитесь, что созданная до остановки запись осталась:

```sh
docker compose exec -T postgres sh -c \
  "psql -U \"\$POSTGRES_USER\" -d \"\$POSTGRES_DB\" -c \"SELECT note FROM local_db_check WHERE id = 1;\""
```

Запрос должен вернуть `persisted`: команда `docker compose down` удаляет
контейнер, но сохраняет именованный Docker volume с данными.

### Остановка и удаление локальных данных

Для штатной остановки PostgreSQL и удаления контейнера, но с сохранением базы
для следующего запуска, выполните:

```sh
docker compose down
```

Чтобы безвозвратно удалить локальные данные PostgreSQL вместе с Docker volume,
выполните:

```sh
docker compose down -v
```

После `down -v` следующий запуск создаст пустую базу. Не используйте эту
команду, если локальные данные нужны для работы.

## База данных API

API читает строку подключения из `apps/api/.env`. Создайте файл из шаблона,
сгенерируйте Prisma Client и примените миграции. Команды выполняются из корня
репозитория:

```sh
cp apps/api/.env.example apps/api/.env
pnpm --filter @warehouse/api prisma:generate
pnpm --filter @warehouse/api prisma:migrate
```

Для интеграционных и e2e-тестов создайте отдельную тестовую базу один раз:

```sh
docker compose exec -T postgres sh -c 'createdb -U "$POSTGRES_USER" warehouse_test'
```

Тестовая база указывается в `TEST_DATABASE_URL` из `apps/api/.env`.
`TEST_DATABASE_URL` должен указывать на другую физическую базу, чем
`DATABASE_URL`: перед изменениями setup сравнивает host, port и имя базы и
останавливается при совпадении. Схема из `?schema=` (`warehouse_api` в примере)
пересоздаётся автоматически, миграции применяются в неё.

Подробности о переменных окружения, миграциях и проверках — в
[README API](apps/api/README.md). Интеграционные и e2e-тесты API используют
отдельную тестовую базу: setup пересоздаёт только выделенную схему и применяет
миграции, затем тесты создают и удаляют записи `User` в этой схеме. Объекты в
`public` и других схемах не изменяются; при наличии `public.User` или
`public.Warehouse` setup останавливается с диагностикой до очистки схемы.

## Структура

```text
apps/
  web/                 # Next.js: интерфейс приложения
  api/                 # NestJS: API, доступ и данные
  simulation/          # Node.js: исполнение симуляции
packages/
  contracts/           # Общие контракты — инструмент обсуждается
  warehouse-renderer/  # Сетка склада на Konva для Web
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
pnpm --filter @warehouse/api test:integration
pnpm --filter @warehouse/api test:e2e
```

Turbo запускает соответствующие скрипты из `package.json` workspace-пакетов.
`dev`, `build`, `typecheck` и `lint` выполняют задачи Web, API и Simulation.
`test` запускает модульные тесты API и Web. У Simulation тестовый скрипт пока не объявлен.
`test:integration` проверяет API на отдельной тестовой базе из `TEST_DATABASE_URL`
и сам применяет миграции в её выделенной схеме. `test:e2e` использует тот же
setup и `TEST_DATABASE_URL`. Эти наборы запускаются последовательно: каждый
пересоздаёт выделенную тестовую схему.

## CI

Workflow GitHub Actions из `.github/workflows/ci.yml` запускается при создании
или обновлении pull request в `main`, а также при push в эту ветку.
Новый запуск для той же ветки или pull request отменяет предыдущий незавершённый
запуск.

В PR отображаются отдельные jobs:

- `Format` — `pnpm format:check`;
- `Lint` — `pnpm lint`;
- `Typecheck` — `pnpm typecheck`;
- `Build` — `pnpm build`;
- `Test` — `pnpm test`.
- `API database tests` — integration и e2e-тесты API на PostgreSQL.

Каждая job устанавливает зависимости командой `pnpm install --frozen-lockfile`.
Это гарантирует, что CI завершится ошибкой, если `package.json` и
`pnpm-lock.yaml` рассинхронизированы.

Чтобы воспроизвести проверки локально на чистом checkout, выполните из корня
репозитория:

```sh
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
pnpm test
```

Задание `Test` запускает модульные тесты API и Web. У Simulation пока нет скрипта `test`.

В отличие от unit-тестов, database-проверки требуют подготовленной PostgreSQL,
баз `warehouse` и `warehouse_test`, а также `DATABASE_URL` и
`TEST_DATABASE_URL`. Подготовьте их по инструкции в
[README API](apps/api/README.md), затем выполните:

```sh
pnpm --filter @warehouse/api prisma:migrate:deploy
pnpm --filter @warehouse/api test:e2e
pnpm --filter @warehouse/api test:integration
```

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

### Интеграции AI-клиентов

Общие workflows OpenSpec входят в репозиторий:

- `.agents/skills/openspec-*/` — общие skills, которые OpenCode читает автоматически;
- `.cursor/skills/` и `.cursor/commands/` — skills и команды `/opsx-*` для Cursor;
- `.claude/skills/` и `.claude/commands/opsx/` — skills и команды `/opsx:*` для Claude Code.

После клонирования перезапустите AI-клиент для обнаружения skills и команд.
В OpenCode попросите загрузить нужный skill, например `openspec-propose`.
Универсальная интеграция `.agents/` не создаёт короткие команды `/opsx-*`.
Маркер `.agents/skills/.openspec-target` также хранится в Git: он позволяет
OpenSpec обнаружить универсальную интеграцию при обновлении.

Сгенерированные workflows вызывают `openspec` напрямую. Чтобы запускать их
без изменения команд, установите глобально версию из `package.json`:

```sh
pnpm add -g @fission-ai/openspec@1.17.0
openspec --version
```

После обновления версии OpenSpec в `package.json` обновите и глобальную установку.
Альтернатива — использовать локальный CLI через `pnpm exec openspec`;
в зависимости от AI-клиента и настроек доступа это может потребовать
дополнительного разрешения. Глобальная установка для этого варианта не нужна.

Поле `allowed-tools: Bash(openspec:*)` в сгенерированных skills и командах
предварительно разрешает соответствующие вызовы в Claude Code. Остальные
инструменты подчиняются обычным настройкам доступа клиента.

Генерируем эти файлы штатным CLI установленной в проекте версии:

```sh
pnpm exec openspec init --tools agents,cursor,claude --profile core --no-animation
```

После обновления зависимости OpenSpec обновите интеграции той же командой
и проверьте diff перед включением в PR. Генерируемые инструкции workflows
поддерживаются CLI; правила Warehouse и человеческие согласования находятся
в `AGENTS.md`, ADR-002 и `openspec/config.yaml`.

Личный профиль OpenCode (`.opencode/`, `opencode.json`, `opencode.jsonc`)
остаётся в `.gitignore`. Не храните в `.opencode/skills/` дубликаты
`openspec-*`: они могут перекрыть общие skills из `.agents/skills/`.
В `.cursor/` и `.claude/` публикуем только общие интеграции OpenSpec;
личные настройки и секреты в эти каталоги не добавляем.

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
