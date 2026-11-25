# Tasks

## 1. Согласование внешнего поведения

- [ ] 1.1 Передать представителям Web proposal и `warehouse-management` на
  ревью: подтвердить единственное поле `name`, маршруты, статусы, порядок
  списка `createdAt DESC, uuid DESC`, обёртки `warehouse`/`warehouses`, единый
  `404`, `Cache-Control: no-store`, регистронезависимый UUID пути и отсутствие
  пагинации, credentialed CORS/preflight и порядок ошибки `UUID → body`;
  проверка: в задаче или PR есть комментарий с согласием и примерами
  запросов/ответов.
- [ ] 1.2 Сверить `400`/`401`/`403`/`503`, error envelope и порядок
  `маршрут/метод → Origin/Referer → сессия → UUID → body → owner scope` с
  согласованной ревизией PR #61; для `GET` этап источника пропускается,
  отсутствующие одновременно `Origin` и `Referer` на изменяющем маршруте дают
  `403`, а credentialed CORS/preflight применяется также к складам. Текущая
  сверка опирается на `e870a35d`, но не заменяет её человеческого approval. При
  изменении наблюдаемого поведения обновить proposal, spec и design; проверка:
  `pnpm exec openspec validate add-warehouse-crud --strict --no-interactive`
  проходит, а согласованная ревизия указана в журнале ниже.
- [ ] 1.3 Получить человеческое согласование спецификации по ADR-002 и
  зафиксировать человека, ссылку и ревизию; проверка: журнал согласований
  содержит эти три значения, а change ещё не получает implementation-код.
- [ ] 1.4 После слияния #61 перенести общий справочник ошибок из auth-спеки в
  `docs/api/error-codes.md`, обновить ссылку auth-спеки и добавить
  `404 WAREHOUSE_NOT_FOUND` с сообщением «Склад не найден»; проверка: auth- и
  warehouse-спеки ссылаются на один справочник, а в #61 не добавлялся код
  склада.

## 2. Зависимость авторизации и ревью тестов

- [ ] 2.1 Дождаться реализации #40 и проверить её публичный способ
  аутентифицировать двух тестовых пользователей и получить `401` без сессии;
  проверка: поддерживаемый auth e2e-сценарий проходит и его ревизия записана в
  design или журнале change.
- [ ] 2.2 До добавления warehouse-тестов отдельно выполнить существующие
  зелёные наборы: `pnpm --filter @warehouse/api test --runInBand` и
  `pnpm --filter @warehouse/api test:integration test/prisma.integration-spec.ts`.
  После изоляции из 2.3, но до добавления `warehouses.e2e-spec.ts`, отдельно
  выполнить `pnpm --filter @warehouse/api test:e2e test/app.e2e-spec.ts`.
  Проверка: каждая команда проходит только на существующих соответствующих
  тестах, а её результат и число тестов записаны в PR.
- [ ] 2.3 До первого e2e-прогона перевести `jest-e2e.json` на
  `integration.global-setup.ts` и `integration.setup.ts`, расширив защиту
  public-схемы на `Warehouse`; проверка:
  `pnpm --filter @warehouse/api test:e2e test/app.e2e-spec.ts` проходит на
  `TEST_DATABASE_URL`, а прикладная `DATABASE_URL` не очищается.
- [ ] 2.4 Написать red-тесты по сценариям `warehouse-management`, включая
  запрет `ownerUuid`, нормализацию внешних whitespace code points, границы 100
  Unicode code points, повторяющиеся имена, пустой список, CRUD, изоляцию A/B,
  `400` с `REQUIRED`, `NAME_TOO_LONG` и `INVALID_REQUEST` для `U+0000`, `401`,
  `403`, `404`, `503`, повторное удаление и приоритет отказов: `403` раньше
  сессии и данных, `401`/`503` раньше UUID, UUID раньше тела и owner scope,
  стабильную сортировку, канонизацию UUID, `Cache-Control: no-store`,
  credentialed CORS/preflight, `onDelete: Restrict` и гонку удаления. Отдельные
  команды для новых наборов:

  - `pnpm --filter @warehouse/api test:integration test/warehouses.integration-spec.ts`;
  - `pnpm --filter @warehouse/api test:e2e test/warehouses.e2e-spec.ts`;
  - `pnpm --filter @warehouse/api test -- warehouses --runInBand`.

  До реализации integration red-тест через raw SQL ожидает таблицу `Warehouse`
  в test schema и падает assertion-ом, потому что таблицы ещё нет. Он не
  использует `prisma.warehouse`, так как до 3.1 в сгенерированном клиенте нет
  этого delegate и результатом был бы не относящийся к поведению `TypeError`.
  После 2.3 e2e red-тест получает текущий `404` вместо ожидаемого
  CRUD-ответа. Unit red-тест запускается после появления минимальной тестируемой
  формы модуля и должен падать assertion-ом наблюдаемого правила валидации или
  owner scope, а не ошибкой импорта.

  Матрица согласуемых тестов:

  - unit: ECMAScript trim, сохранение внутренней табуляции, 100/101 Unicode
    code points, `REQUIRED`, `NAME_TOO_LONG`, не-объектное тело, нестроковый
    `name`, `U+0000`, лишние поля, невалидный UUID, его канонизация к нижнему
    регистру и mapping нулевой owner-scoped мутации/P2025 в
    `WAREHOUSE_NOT_FOUND`;
  - integration: raw SQL red-проверка отсутствующей таблицы до 3.1; затем UUID
    и серверные timestamps без предположения об их равенстве, нормализованное
    имя в БД, два склада одного владельца с одинаковым именем, сохранность
    после перезапуска, выборка только по `ownerUuid`, `onDelete: Restrict` и
    список с явно заданными разными и равными `createdAt` для проверки
    `createdAt DESC, uuid DESC`;
  - e2e успешных ответов: `POST`, `GET /:uuid` и `PATCH` в обёртке
    `warehouse`, пустой и отсортированный список в `warehouses`, `DELETE 204`
    без тела, UUID пути в верхнем регистре, `Cache-Control: no-store` и
    обновлённый `updatedAt` после `PATCH` без сравнения `createdAt` и
    `updatedAt` при создании, а также `Access-Control-Allow-Origin` и
    `Access-Control-Allow-Credentials` для доверенного источника;
  - e2e ошибок данных: точные JSON-тела `REQUIRED`, `NAME_TOO_LONG`,
    `INVALID_REQUEST` для `U+0000`, а после добавления кода в общий справочник —
    `WAREHOUSE_NOT_FOUND` для валидного отсутствующего, чужого и удалённого
    UUID, причём каждый такой ответ имеет `Cache-Control: no-store`;
  - e2e порядка отказов: неизвестный маршрут с недоверенным Origin → `404`,
    распознанный изменяющий маршрут с недоверенным Origin → `403` до сессии и
    тела, отсутствие Origin и Referer → `403`, отсутствие сессии при
    доверенном источнике → `401` до UUID/body, недоступный Redis для
    предъявленной сессии → `503` до UUID/body, действительная сессия с
    некорректным UUID или чужим UUID и некорректным телом → `400`, а
    некорректный UUID вместе с невалидным телом → `400 INVALID_REQUEST` без
    `fields`; доверенный `OPTIONS` известного маршрута → `204` с CORS и
    `no-store`, недоверенный/`null`/отсутствующий Origin → `403`, `OPTIONS`
    неизвестного маршрута → `404`;
  - e2e гонок: два параллельных `DELETE` дают одну `204` и одну `404`, а
    одновременные допустимые `PATCH` и `DELETE` не дают `500`.
- [ ] 2.5 Передать тесты на человеческое ревью и зафиксировать отдельное
  согласование по ADR-002; проверка: журнал содержит ссылку, ревизию и
  подтверждает, что до approval нет реализации CRUD.

## 3. Постоянная модель и безопасное хранилище

- [ ] 3.1 Добавить модель `Warehouse`, обратную связь `User`, составной индекс
  списка `ownerUuid, createdAt DESC, uuid DESC` и Prisma migration с
  ограничением имени и явным внешним ключом `onDelete: Restrict`; проверка:
  `pnpm --filter @warehouse/api test:integration test/warehouses.integration-spec.ts`
  применяет migration к чистой test schema через global setup, который передаёт
  Prisma CLI `DATABASE_URL`, равный `TEST_DATABASE_URL`; bare
  `prisma:migrate:deploy` для этой проверки не используется.
- [ ] 3.2 Дополнить integration-тесты проверкой UUID, серверных timestamps без
  предположения `createdAt === updatedAt`, сохранности между перезапусками,
  выборки только по владельцу, одинаковых имён без ограничения уникальности,
  `onDelete: Restrict` и стабильного порядка на fixture с явно заданными
  разными и равными `createdAt`; проверка:
  `pnpm --filter @warehouse/api test:integration` проходит на отдельной БД.

## 4. Защищённый HTTP CRUD

- [ ] 4.1 Создать отдельный NestJS-модуль складов с строгой Zod-валидацией и
  owner-scoped сервисом, используя только текущего пользователя из #40;
  канонизировать валидный UUID пути к нижнему регистру и преобразовывать
  нулевой результат owner-scoped мутации/P2025 в `WAREHOUSE_NOT_FOUND`, не
  разделяя поиск и изменение записи;
  проверка: unit-тесты проходят для ECMAScript trim, границы Unicode code
  points, `REQUIRED`, `NAME_TOO_LONG`, `INVALID_REQUEST`, лишних полей,
  повторяющихся имён, UUID в верхнем регистре, отсутствующего/чужого склада и
  конкурентного удаления.
- [ ] 4.2 Добавить `POST`, `GET`, `PATCH` и `DELETE` маршруты и подключить
  согласованный auth guard без передачи UUID владельца из запроса; проверка:
  e2e-тесты подтверждают обёртки `warehouse`/`warehouses`, `201`, `200`,
  `204`, `400`, `401`, единый `404`, `403` до проверки сессии и данных, `503`
  до проверки UUID и тела, `Cache-Control: no-store` для каждого ответа,
  credentialed CORS и preflight, UUID раньше невалидного тела, стабильный
  порядок списка, отсутствие `500` при параллельном удалении и отсутствие
  изменений при отклонённом запросе.
- [ ] 4.3 Обновить `apps/api/README.md` инструкциями миграции, тестовой БД,
  auth-flow, credentialed CORS/preflight, `Cache-Control: no-store`,
  `onDelete: Restrict` и ручным CRUD-сценарием двух пользователей; проверка:
  по README можно создать склад, перезапустить API, получить его снова и
  убедиться, что пользователь B его не видит.

## 5. Интеграционная проверка и код-ревью

- [ ] 5.1 Запустить `pnpm --filter @warehouse/api test --runInBand`,
  `pnpm --filter @warehouse/api test:integration`,
  `pnpm --filter @warehouse/api test:e2e`,
  `pnpm --filter @warehouse/api lint`,
  `pnpm --filter @warehouse/api typecheck`,
  `pnpm --filter @warehouse/api build` и `pnpm format:check`; проверка: все
  команды завершаются успешно.
- [ ] 5.2 Проверить diff и передать код человеку на ревью; проверка: нет
  изменений Web/Simulation, секретов, новых неоговорённых зависимостей или
  функций вне `warehouse-management`, а результаты проверок приложены к PR.

## Журнал согласований

- Сверка с auth-контрактом: PR #61, ревизия `e870a35dad1fd93a22e9fb49f860696b9984e47f`
  изучена при обновлении change; человеческое согласование PR ещё не получено,
  поэтому сверка повторяется в 1.2 после approval.
- Разрешение на подготовку независимых от авторизации тестов: StasKobles,
  [ревью PR #69 от 24.11.2026](https://github.com/warehouse-robotics-lab/warehouse-platform/pull/69#pullrequestreview-6036238996),
  ревизия `311fe806a1cf7c9e5e1ca1a926218f59f9f31eae`. Ревью разрешает
  продолжать такие тесты до готовности #40; защищённые e2e требуют изоляции БД
  и реализации #40. Итоговое совместное ревью спеки и тестов требуется перед
  реализацией CRUD. Это разрешение не закрывает 1.1, 1.2, 1.3 или 2.5.
- Согласование спецификации: пользователь подтвердил переход к тестам в этой
  сессии; итоговое согласование спеки вместе с тестами в PR ещё не получено.
- Согласование тестов: не получено.

## Результаты baseline от 25.11.2026

Проверки выполнены в `feat/api-warehouse-crud` на HEAD
`311fe806a1cf7c9e5e1ca1a926218f59f9f31eae` с локальными документальными
правками, до добавления warehouse-тестов. Node.js `24.22.2`, pnpm `11.1.1`.

| Команда | Результат |
| --- | --- |
| `pnpm --filter @warehouse/api test --runInBand` | PASS: 4 набора, 23 теста, 0 snapshots. |
| `pnpm --filter @warehouse/api test:integration test/prisma.integration-spec.ts` | Setup завершился ошибкой `TEST_DATABASE_URL is not set`; тесты не запускались. |

При первом прогоне `apps/api/.env` отсутствовал, `TEST_DATABASE_URL` не был
задан, Docker daemon был недоступен.

### Повторный baseline после настройки окружения

25.11.2026 обе команды повторно выполнены на том же HEAD с документальными
правками, после отката изменений этапа 2. Warehouse-тестов и изменений
тестовой инфраструктуры пока нет.

| Команда | Результат |
| --- | --- |
| `pnpm --filter @warehouse/api test --runInBand` | PASS: 4 набора, 23 теста, 0 snapshots. |
| `pnpm --filter @warehouse/api test:integration test/prisma.integration-spec.ts` | PASS: 1 набор, 14 тестов, 0 snapshots. |

Setup пересоздал выделенную схему `warehouse_api` тестовой БД
`warehouse_test` на `localhost:5433` и применил миграцию
`20261113000000_add_user`; прикладная БД не использовалась. Результаты
подтверждают этап 1, шаг 2 плана. Пункт OpenSpec 2.2 остаётся открытым:
существующий e2e будет запущен только после изоляции в 2.3. Результаты
подготовлены локально для включения в PR; публикация в GitHub не выполнялась.

## Workflow follow-up

- При явном поручении на коммит после review использовать Conventional Commit:
  `docs(openspec): specify warehouse CRUD` для planning-артефактов,
  `test(api): isolate e2e database` для изоляции e2e,
  `feat(api): add warehouse persistence` для миграции и
  `feat(api): add owner-scoped warehouse CRUD` для endpoint.
- Архивировать change только по явной просьбе после человеческого code review
  и фиксации scenario evidence.
