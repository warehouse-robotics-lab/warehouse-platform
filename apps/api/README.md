# @warehouse/api

NestJS API для Warehouse Platform.

Отвечает за пользователей, доступ к складам, сохранение данных и внешний API. Границы ответственности предложены в [ADR-003](../../docs/adr/003-module-interaction.md).

## Требования

- Node.js 24.22.2
- pnpm 11.1.1
- Docker Compose v2 для локальной PostgreSQL

Установите зависимости из корня репозитория:

```sh
pnpm install
```

Перед запуском проверок и приложения выберите версию Node.js из `.nvmrc`:

```sh
nvm use
```

## Конфигурация

Создайте локальный файл окружения на основе шаблона:

```sh
cp apps/api/.env.example apps/api/.env
```

| Переменная | Значение по умолчанию | Описание |
| --- | --- | --- |
| `PORT` | `3001` | Порт HTTP-сервера; целое число от `1` до `65535`. |
| `DATABASE_URL` | — | Строка подключения PostgreSQL; обязательна, начинается с `postgresql://` или `postgres://`. |
| `TEST_DATABASE_URL` | — | Отдельная база для `test:integration` и `test:e2e`; обязательна для обоих наборов. |

Приложение не запустится, если `PORT` или `DATABASE_URL` имеют недопустимое значение.

### PostgreSQL

Локальная база запускается из корня репозитория по инструкции в
[корневом README](../../README.md). Строка `DATABASE_URL` в `apps/api/.env`
должна соответствовать переменным `POSTGRES_USER`, `POSTGRES_PASSWORD`,
`POSTGRES_PORT` и `POSTGRES_DB` из корневого `.env`. Пример значений — в
`apps/api/.env.example`.

Если параметры PostgreSQL в корневом `.env` изменены, обновите `DATABASE_URL`
соответственно. Специальные символы в пароле нужно URL-кодировать.

Если в `DATABASE_URL` указан параметр `?schema=...`, Prisma CLI применяет
миграции в этой схеме, а `PrismaService` передаёт её в `@prisma/adapter-pg`
для модельных запросов.

### Тестовая PostgreSQL

Интеграционные и e2e-тесты используют полностью одноразовую базу и отдельную
роль без повышенных прав. Для выделенного локального PostgreSQL можно создать
их один раз из корня репозитория:

```sh
docker compose exec -T postgres sh -c \
  'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1' <<'SQL'
CREATE ROLE warehouse_test LOGIN PASSWORD 'warehouse_test'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
CREATE DATABASE warehouse_isolated_test OWNER warehouse_test;
SELECT format('REVOKE CONNECT ON DATABASE %I FROM PUBLIC', datname)
FROM pg_database WHERE datallowconn
\gexec
SQL
```

Эта команда отзывает `CONNECT` у `PUBLIC` во всех базах сервера: другие роли
без отдельного разрешения потеряют доступ. Выполняйте её только на выделенном
локальном сервере; для общего сервера попросите администратора ограничить
тестовую роль без нарушения доступа других пользователей. Если роль или база
уже существует, выберите новые имена: команда их не пересоздаёт. `REVOKE`
изменяет права существующих баз.

Укажите тестовую роль и базу в `TEST_DATABASE_URL` из `apps/api/.env`; пример
есть в `apps/api/.env.example`. Если локальный файл уже существует, обновите
переменную вручную. Пример пароля предназначен только для локальной разработки.
Если порт PostgreSQL изменён, укажите его и в `TEST_DATABASE_URL`.

`DATABASE_URL` и `TEST_DATABASE_URL` обязательны и должны указывать на разные
базы с разными именами, даже если серверы или порты различаются. Setup
консервативно отклоняет одинаковые или неоднозначные имена; он не проверяет
права роли, поэтому ограничьте их при настройке PostgreSQL. Используйте прямые
подключения: сравнение имён не распознаёт прокси, переименовывающий базы. Имена
баз должны состоять из латинских букв, цифр, `_` или `-`.

Setup удаляет схему из `?schema=` с `CASCADE`, поэтому зависимые объекты в
других схемах также могут быть удалены. Вся тестовая база должна быть
одноразовой. При наличии `public.User` или `public.Warehouse` setup дополнительно
останавливается до очистки. Схема из `?schema=` должна быть не `public`.

### CI

Job `API database tests` в GitHub Actions запускает одноразовый service container
`postgres:17-alpine`. Тестовые учётные данные и строки подключения заданы в
workflow: `.env` и секреты репозитория не нужны.

Container создаёт базу `warehouse`, а job после healthcheck создаёт отдельную
`warehouse_isolated_test` и ограниченную роль `warehouse_test`. Доступ этой
роли к остальным базам контейнера закрывается. В CI используются переменные:

```dotenv
DATABASE_URL=postgresql://warehouse:warehouse@localhost:5432/warehouse?schema=warehouse_api
TEST_DATABASE_URL=postgresql://warehouse_test:warehouse_test@localhost:5432/warehouse_isolated_test?schema=warehouse_api
```

Job устанавливает зависимости, применяет `prisma migrate deploy` к базе из
`DATABASE_URL`, затем запускает `test:e2e` и `test:integration`.
Оба набора пересоздают схему `warehouse_api` в
`warehouse_isolated_test` и применяют миграции к этой тестовой базе. E2e больше не
требует миграции основной базы; отдельный шаг её применения пока остаётся
в workflow. E2e запускается первым на новой тестовой базе и проверяет, что
приложение подключено к ней и таблица `User` из миграции доступна.

## Prisma

Команды ниже выполняются из каталога `apps/api`.

Схема данных находится в `apps/api/prisma/schema.prisma`, миграции — в
`apps/api/prisma/migrations/`. Prisma Client генерируется в
`apps/api/src/generated/prisma` и не хранится в Git.

Сгенерировать клиент:

```sh
pnpm prisma:generate
```

Применить миграции к базе из `DATABASE_URL`:

```sh
pnpm prisma:migrate
```

Для чистого окружения используйте применение без создания новых миграций:

```sh
pnpm prisma:migrate:deploy
```

`build`, `dev`, `lint`, `typecheck`, `test`, `test:e2e` и `test:integration`
генерируют Prisma Client перед запуском. `start`, `start:dev` и `start:debug`
используют уже сгенерированный клиент: перед первым запуском выполните
`pnpm prisma:generate` или `pnpm build`. `PrismaService` подключается к
PostgreSQL при старте API и закрывает соединение при завершении приложения.

## Запуск

Запустите API в режиме наблюдения из каталога `apps/api`:

```sh
pnpm dev
```

Из корня репозитория та же команда запускается через pnpm:

```sh
pnpm --filter @warehouse/api dev
```

Через Turbo из корня можно запустить все доступные приложения:

```sh
pnpm dev
```

## Проверочная ручка

После запуска отправьте запрос `GET http://localhost:3001/health`:

```sh
curl http://localhost:3001/health
```

```json
{
  "status": "ok",
  "service": "api"
}
```

## Проверки

Запускайте из каталога `apps/api`:

```sh
pnpm typecheck
pnpm build
pnpm test
pnpm test:integration
pnpm test:e2e
```

Из корня репозитория те же скрипты доступны через
`pnpm --filter @warehouse/api <script>`.

Интеграционные и e2e-тесты используют `TEST_DATABASE_URL` и отдельную одноразовую
базу. Setup проверяет имена баз до удаления схемы из `?schema=` с
`CASCADE`, затем создаёт её заново и применяет миграции. Зависимые объекты в
других схемах тоже могут быть удалены.

В выделенной схеме тесты создают и удаляют записи `User`: `deleteMany()`
выполняется перед каждым тестом, проверки уникальности и ограничений создают
пользователей. `test:e2e` использует тот же setup: Prisma CLI получает
`DATABASE_URL`, равный `TEST_DATABASE_URL`, а до создания Nest-приложения
setup устанавливает тот же тестовый URL для API. Перед созданием приложения
e2e проверяет равенство этих адресов; отдельная проверка обращается к тестовой
базе и таблице `User`. Оба набора требуют доступную PostgreSQL и автоматически
применяют миграции. Запускайте их последовательно: каждый прогон пересоздаёт
выделенную тестовую схему.

Integration-набор проверяет сохранность контрольной таблицы при разных адресах
одной базы. Сценарий выполняется для `localhost` и `127.0.0.1`, как в CI; для
другого хоста он пропускается.

`test:e2e` и `test:integration` запускают Jest с `--experimental-vm-modules`:
Prisma 7 загружает WASM query compiler через динамический импорт.
