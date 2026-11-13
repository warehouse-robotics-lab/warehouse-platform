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

Приложение не запустится, если `PORT` или `DATABASE_URL` имеют недопустимое значение.

### PostgreSQL

Локальная база запускается из корня репозитория по инструкции в
[корневом README](../../README.md). Строка `DATABASE_URL` в `apps/api/.env`
должна соответствовать переменным `POSTGRES_USER`, `POSTGRES_PASSWORD`,
`POSTGRES_PORT` и `POSTGRES_DB` из корневого `.env`. Пример значений — в
`apps/api/.env.example`.

Если параметры PostgreSQL в корневом `.env` изменены, обновите `DATABASE_URL`
соответственно. Специальные символы в пароле нужно URL-кодировать.

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

`build`, `dev`, `typecheck`, `test`, `test:e2e` и `test:integration`
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

Интеграционные тесты выполняются на PostgreSQL из `DATABASE_URL` и требуют
применённых миграций. Они только читают данные: проверяют подключение,
модель `User`, наличие таблицы и уникального индекса. Тесты не создают,
не изменяют и не удаляют записи. `test:e2e` также требует доступную базу,
так как API подключается к ней при старте.

`test:e2e` и `test:integration` запускают Jest с `--experimental-vm-modules`:
Prisma 7 загружает WASM query compiler через динамический импорт.
