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

Интеграционные и e2e-тесты используют отдельную базу из `TEST_DATABASE_URL`, а не
`DATABASE_URL`. Создайте её один раз из корня репозитория, если базы ещё нет:

```sh
docker compose exec -T postgres sh -c 'createdb -U "$POSTGRES_USER" warehouse_test'
```

В `TEST_DATABASE_URL` укажите тестовую базу с параметром `?schema=warehouse_api`.
Пример есть в `apps/api/.env.example`. Если параметры PostgreSQL изменены,
обновите `TEST_DATABASE_URL` так же, как `DATABASE_URL`. Схема должна быть не
`public`: это проверяет, что Prisma CLI и runtime используют одну и ту же схему.

`TEST_DATABASE_URL` должен указывать на другую физическую базу, чем
`DATABASE_URL`. Перед изменениями setup сравнивает host, port и имя базы и
останавливается, если они совпадают. Разрушительная очистка ограничена схемой
из `?schema=`: если в `public` уже есть таблица `User` или `Warehouse`, setup
останавливается с диагностикой до очистки схемы и не удаляет эти таблицы.

### CI

Job `API database tests` в GitHub Actions запускает одноразовый service container
`postgres:17-alpine`. Тестовые учётные данные и строки подключения заданы в
workflow: `.env` и секреты репозитория не нужны.

Container создаёт базу `warehouse`, а job после healthcheck создаёт отдельную
`warehouse_test`. В CI используются следующие переменные:

```dotenv
DATABASE_URL=postgresql://warehouse:warehouse@localhost:5432/warehouse?schema=warehouse_api
TEST_DATABASE_URL=postgresql://warehouse:warehouse@localhost:5432/warehouse_test?schema=warehouse_api
```

Job устанавливает зависимости, применяет `prisma migrate deploy` к базе из
`DATABASE_URL`, затем запускает `test:e2e` и `test:integration`.
Оба тестовых набора пересоздают только схему `warehouse_api` в
`warehouse_test` и применяют миграции к этой тестовой базе. E2e больше не
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

Интеграционные и e2e-тесты используют `TEST_DATABASE_URL` и отдельную тестовую базу.
Перед запуском setup проверяет, что `DATABASE_URL` и `TEST_DATABASE_URL` не
указывают на одну физическую базу, удаляет только схему из `?schema=`,
создаёт её заново и применяет в неё миграции. Объекты в `public` и других схемах
не изменяются; при наличии `public.User` или `public.Warehouse` setup
останавливается с диагностикой до очистки схемы.

В выделенной схеме тесты создают и удаляют записи `User`: `deleteMany()`
выполняется перед каждым тестом, проверки уникальности и ограничений создают
пользователей. `test:e2e` использует тот же setup: Prisma CLI получает
`DATABASE_URL`, равный `TEST_DATABASE_URL`, а до создания Nest-приложения
setup устанавливает тот же тестовый URL для API. Перед созданием приложения
e2e проверяет равенство этих адресов; отдельная проверка обращается к тестовой
базе и таблице `User`. Оба набора требуют доступную PostgreSQL и автоматически
применяют миграции. Запускайте их последовательно: каждый прогон пересоздаёт
выделенную тестовую схему.

`test:e2e` и `test:integration` запускают Jest с `--experimental-vm-modules`:
Prisma 7 загружает WASM query compiler через динамический импорт.
