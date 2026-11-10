# Web

Пользовательское приложение на Next.js и TypeScript. Workspace-пакет — `@warehouse/web`.

Здесь будут страницы, формы, редактор карты и диспетчерская. Приложение использует компонент отрисовки склада из `@warehouse/warehouse-renderer`.

Код интерфейса лежит в `src` по Feature-Sliced Design. Маршруты Next.js остаются в `src/app` и только подключают страницы из `src/_pages`. Общий UI-kit и утилиты находятся в `src/shared`.

## Команды

Из корня репозитория:

```sh
pnpm --filter @warehouse/web dev
pnpm --filter @warehouse/web build
pnpm --filter @warehouse/web typecheck
pnpm --filter @warehouse/web lint
```

Корневые `pnpm dev`, `pnpm build`, `pnpm typecheck` и `pnpm lint` запускают те же скрипты через Turbo. После сборки продакшен-сервер стартует командой `pnpm --filter @warehouse/web start`.

Из каталога `apps/web` скрипты пакета вызываются напрямую:

```sh
pnpm dev
pnpm build
pnpm typecheck
pnpm lint
pnpm start
```

Сервер разработки открывается на `http://localhost:3000`. Команды `format` и `format:check` объявлены в корне репозитория. Из `apps/web` их запускают так: `pnpm -w format`.

## Переменные окружения

Для запуска, сборки и проверки типов переменные окружения не требуются.

Локальные значения храните в `apps/web/.env.local`. Этот файл не коммитится. Шаблон без обязательных переменных — `apps/web/.env.example`.
