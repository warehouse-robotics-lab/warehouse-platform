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
pnpm test
pnpm start
```

Сервер разработки открывается на `http://localhost:3000`. Команды `format` и `format:check` объявлены в корне репозитория. Из `apps/web` их запускают так: `pnpm -w format`.

## Переменные окружения

Для запуска, сборки и проверки типов переменные окружения не требуются.

Локальные значения храните в `apps/web/.env.local`. Этот файл не коммитится. Шаблон без обязательных переменных — `apps/web/.env.example`.

Для локальной проверки формы входа можно задать две переменные:

- `NEXT_PUBLIC_LOGIN_MOCK_RESULT` — результат тестовой отправки:
  `success`, `invalid-credentials` или `technical-error`. По умолчанию — `success`.
- `NEXT_PUBLIC_LOGIN_MOCK_DELAY_MS` — задержка ответа в миллисекундах:
  целое число от 0 до 10000. По умолчанию — 1500.

Если переменная не задана, используется её значение по умолчанию.
Пустая строка считается ошибкой настройки. После изменения переменных
перезапустите сервер разработки.
