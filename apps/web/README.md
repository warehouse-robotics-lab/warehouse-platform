# Web

Пользовательское приложение на Next.js и TypeScript. Workspace-пакет — `@warehouse/web`.

Здесь будут страницы, формы, редактор карты и диспетчерская. Приложение использует компонент отрисовки склада из `@warehouse/warehouse-renderer`.

Код интерфейса лежит в `src` по Feature-Sliced Design:

- `src/app` — маршруты Next.js. Файлы `page.tsx` только подключают страницы из `src/_pages`. Файлы `layout.tsx` групп маршрутов собирают каркас из виджетов, например `src/app/(cabinet)/layout.tsx`.
- `src/_pages` — страницы.
- `src/widgets` — крупные блоки интерфейса: шапка `app-header` и каркас личного кабинета `cabinet-layout`.
- `src/shared` — общий UI-kit (компоненты shadcn/ui) и утилиты.

## Маршруты

- `/` — главная страница.
- `/warehouses` — страница «Мои склады» в каркасе личного кабинета (группа маршрутов `(cabinet)`).
- `/warehouses/demo/edit` — демо-редактор склада. Показывает сетку 20×20 из `@warehouse/warehouse-renderer`. Карта с API не загружается.

## Команды

Перед `dev`, `build` и `typecheck` соберите renderer, если каталога `packages/warehouse-renderer/dist` ещё нет:

```sh
pnpm --filter @warehouse/warehouse-renderer build
```

Из корня репозитория:

```sh
pnpm --filter @warehouse/warehouse-renderer build
pnpm --filter @warehouse/web dev
pnpm --filter @warehouse/web build
pnpm --filter @warehouse/web typecheck
pnpm --filter @warehouse/web lint
```

Корневые `pnpm dev`, `pnpm build` и `pnpm typecheck` через Turbo сначала собирают зависимости Web, в том числе `@warehouse/warehouse-renderer`. Прямые команды внутри `apps/web` этого не делают. После сборки продакшен-сервер стартует командой `pnpm --filter @warehouse/web start`.

Из каталога `apps/web` скрипты пакета вызываются напрямую. Перед `dev`, `build` и `typecheck` сначала выполните из корня `pnpm --filter @warehouse/warehouse-renderer build`, затем:

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
