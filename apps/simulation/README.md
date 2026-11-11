# Simulation

Серверное приложение на Node.js и TypeScript для исполнения симуляции склада.
Workspace-пакет — `@warehouse/simulation`.

Здесь будут обработка команд запуска, движение роботов и выполнение заданий.
Сейчас подготовлена запускаемая основа по Issue #6: вход в приложение, сборка,
проверка типов, линтинг и остановка процесса. Движение роботов, HTTP, Redis
и BullMQ пока не подключены.

Взаимодействие с API описано в [ADR-003](../../docs/adr/003-module-interaction.md). Ядро симуляции планируется разместить
в `packages/simulation-core`: там будут алгоритмы и логика ядра, независимые от
транспорта и внешних сервисов. Приложение `apps/simulation` будет подключать ядро
и обеспечивать его запуск и взаимодействие с инфраструктурой.

## Окружение

Используйте Node.js из корневого `.nvmrc` и pnpm из поля `packageManager`
корневого `package.json`. Установка окружения и общие правила разработки описаны
в [корневом README](../../README.md).

Зависимости устанавливаются из корня репозитория с общим lockfile:

```sh
pnpm install --frozen-lockfile
```

После изменения зависимостей выполните `pnpm install` и включите обновлённый
`pnpm-lock.yaml` в PR.

## Команды

Из корня репозитория:

```sh
pnpm --filter @warehouse/simulation dev
pnpm --filter @warehouse/simulation build
pnpm --filter @warehouse/simulation typecheck
pnpm --filter @warehouse/simulation lint
pnpm --filter @warehouse/simulation start
```

Перед `start` выполните `build`.

Из каталога `apps/simulation` скрипты пакета вызываются напрямую:

```sh
pnpm dev
pnpm build
pnpm typecheck
pnpm lint
pnpm start
```

- `dev` использует встроенный watch-режим Node.js и загрузчик `tsx` для исполнения
  TypeScript. После изменения исходников приложение перезапускается. Проверка
  типов выполняется отдельно: `tsx` её не выполняет.
- `build` проверяет типы и компилирует `src` в `dist`. Каталог `dist` не коммитится.
- `typecheck` проверяет типы без создания выходных файлов.
- `lint` проверяет исходники и конфигурацию ESLint. Предупреждения считаются ошибкой
  выполнения команды.
- `start` запускает собранный `dist/main.js` через Node.js с поддержкой source maps.

Корневые `pnpm dev`, `pnpm build`, `pnpm typecheck` и `pnpm lint` запускают
соответствующие задачи Web и Simulation через Turbo. Чтобы выбрать только Simulation:

```sh
pnpm dev --filter=@warehouse/simulation
pnpm build --filter=@warehouse/simulation
pnpm typecheck --filter=@warehouse/simulation
pnpm lint --filter=@warehouse/simulation
```

## Переменные окружения

Для текущей основы приложения переменные окружения не требуются.
Приложение не открывает портов и не требует запущенных внешних сервисов.
Автоматическая загрузка `.env` пока не настроена.

## Конфигурация TypeScript

Используется ESM (`"type": "module"`) и разрешение модулей `NodeNext`: собранные
файлы запускаются непосредственно в Node.js. В относительных импортах TypeScript
указывайте расширение выходного файла `.js`.

`target` и `lib` установлены в `ES2022`. Браузерные типы DOM не подключаются;
`@types/node` ограничен веткой 24, соответствующей major-версии Node.js проекта.
Включены `strict`, `noUncheckedIndexedAccess` и `exactOptionalPropertyTypes`.

TypeScript закреплён на **5.9.3**, чтобы использовать ту же версию, что и Web:
генератор Next.js создал приложение с зависимостью `typescript: "^5"`, а общий
lockfile фиксирует для Web версию 5.9.3.

Ветка `typescript-eslint` 8 выбрана с учётом совместимости с этой версией TypeScript.
Используемая версия `typescript-eslint` поддерживает TypeScript `>=4.8.4 <6.1.0`,
поэтому TypeScript 7 пока не используется. При обновлении компилятора проверяйте
[совместимость typescript-eslint](https://typescript-eslint.io/users/dependency-versions/)
и повторно выполняйте линтинг, проверку типов и сборку.

## Качество кода

ESLint использует рекомендуемые правила JavaScript и `typescript-eslint`
с информацией о типах. В частности, проверяются необработанные Promise,
небезопасные операции с `any` и неиспользуемые переменные. Импорты, используемые
только как типы, оформляются через `import type`.

`dist`, `coverage` и `.turbo` исключены из линтинга. Автоматические тесты приложения
пока не настроены.

## Проверка приложения

Выполните из корня репозитория:

1. Запустите приложение в режиме разработки: `pnpm --filter @warehouse/simulation dev`.
   Остановите его перед следующими проверками.
2. Соберите приложение: `pnpm --filter @warehouse/simulation build`.
3. Выполните проверку типов: `pnpm --filter @warehouse/simulation typecheck`.
4. Запустите собранные файлы: `pnpm --filter @warehouse/simulation start`.
   После проверки остановите приложение.
5. Выполните линтинг: `pnpm --filter @warehouse/simulation lint`.

Сборка, проверка типов и линтинг должны завершиться без ошибок.

Пустой интервальный таймер временно удерживает процесс запущенным. Это не шаг
симуляции. Остановка отменяет таймер и позволяет Node.js завершиться естественным
образом.

После подключения очередей и соединений процедуру остановки потребуется дополнить
освобождением этих ресурсов, а необходимость во временном таймере — пересмотреть.
