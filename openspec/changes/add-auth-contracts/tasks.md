# Tasks

Change 1 из плана `Workflow follow-up` (архив `2026-11-27-add-auth-api`). Спецификация
согласована в PR #61; заново не пересматривается. Порядок этапов — ADR-002: тесты →
человеческое ревью → реализация → проверки.

## 1. Подготовка change

- [x] 1.1 Создать `add-auth-contracts` с `skip_specs: true`: новых требований нет,
      реализуются `auth-api`, `user-credentials` и `user-session`.
      Проверка: `openspec validate add-auth-contracts --strict --no-interactive`.
- [x] 1.2 Зафиксировать границы Change 1 в `proposal.md` и `design.md`, сослаться на
      согласованные спецификации и решения 3, 4, 6, 14 без копирования истории ревью.
      Проверка: в документах есть ссылки и явный список Non-Goals.

## 2. Тесты контракта (следующий этап)

- [ ] 2.1 Создать тестовые файлы `@warehouse/contracts` на этапе apply:
      `packages/contracts/test/register-validation.test.ts`,
      `packages/contracts/test/login-validation.test.ts`,
      `packages/contracts/test/field-rules.test.ts`,
      `packages/contracts/test/error-contract.test.ts`.
      Проверка: тесты покрывают допустимые значения, границы, неверные типы,
      обязательные и лишние поля, login против register, Unicode-границы, нормализацию
      email, ровно один `@`, `createdAt` только с `Z`, сохранение пароля, структуру
      ошибок и отсутствие пароля в ответе.
- [ ] 2.2 Создать тест генерации OpenAPI `apps/api/src/openapi/auth-openapi.spec.ts` на
      этапе apply.
      Проверка: тест проверяет четыре адреса, методы, схемы запросов/ответов, статусы,
      заголовки `Cache-Control`, `Retry-After`, `Allow`, `Set-Cookie` и пометку
      «контракт без реализации». Тест проверяет только документ; поведение B1–B9 не
      проверяется.
- [x] 2.3 Подготовить матрицу `test-matrix.md` со связью применимых Scenario и тестов.
      Проверка: у каждого применимого сценария есть файл и имя теста; B1–B9 и F1–F7
      вынесены в раздел «Вне Change 1» без тестов; CORS не заявлен как тест Change 1.
- [ ] 2.4 Передать тесты и матрицу Стасу на человеческое ревью. До согласования
      продуктовую реализацию не начинать.
      Проверка: запись о согласовании в журнале ниже (имя, ссылка, ревизия).

> Матрица 2.3 — план ревью, а не замена тестам. Тестовые файлы 2.1–2.2 создаются и
> запускаются на этапе apply; без них этап 2 не считается закрытым.

## 3. Реализация (заблокирована до 2.4)

- [ ] 3.1 Создать пакет `@warehouse/contracts`: `package.json`, `tsconfig*`, ESLint,
      `src/index.ts`, схемы, типы, справочник ошибок, правила полей и валидаторы из
      `design.md`.
      Проверка: `pnpm --filter @warehouse/contracts test` проходит.
- [ ] 3.2 Собрать OpenAPI в `apps/api/src/openapi/auth-openapi.ts` из схем пакета через
      `z.toJSONSchema`; подключить `@nestjs/swagger` и `/docs`, `/docs-json` в
      `main.ts` без фиктивных auth-контроллеров. Статусы и заголовки только
      документируются; поведение B1–B9 не реализуется. Версия `@nestjs/swagger`
      совместима с Nest 11 и фиксируется в общем lockfile.
      Проверка: `pnpm --filter @warehouse/api test` проходит, включая OpenAPI-тест.
- [ ] 3.3 Подключить `@warehouse/contracts` к API и Web через `workspace:*`, настроить
      порядок сборки в `turbo.json`, добавить тонкий реэкспорт в Web.
      Проверка: `pnpm --filter @warehouse/api typecheck`,
      `pnpm --filter @warehouse/web typecheck` и сборка обоих проходят.
- [ ] 3.4 Обновить README пакета, API и Web; зафиксировать, что формы и транспорт не
      подключены.
      Проверка: README описывает команды, `/docs`, `/docs-json` и границы Change 1.
- [ ] 3.5 Проверить diff: нет чужих изменений, нет реализации B1–B9/F1–F7, версии
      инструментов взяты из проекта, lockfile обновлён через pnpm.
      Проверка: `git diff` просмотрен, состав файлов соответствует Change 1.

## 4. Проверки и PR (заблокированы до 2.4 и 3.x)

- [ ] 4.1 Выполнить целевые проверки и записать точные команды и результаты:
      `pnpm --filter @warehouse/contracts test`,
      `pnpm --filter @warehouse/contracts typecheck`,
      `pnpm --filter @warehouse/contracts build`,
      `pnpm --filter @warehouse/contracts lint`,
      `pnpm --filter @warehouse/api test`,
      `pnpm --filter @warehouse/api typecheck`,
      `pnpm --filter @warehouse/api build`,
      `pnpm --filter @warehouse/web typecheck`,
      `pnpm --filter @warehouse/web build`,
      `pnpm lint`, `pnpm format:check`.
      Проверка: команды сверены с `package.json`; результаты и SHA записаны в PR.
- [ ] 4.2 Выполнить `openspec validate add-auth-contracts --strict --no-interactive`
      после правок артефактов.
      Проверка: команда завершается без ошибок.
- [ ] 4.3 Подготовить небольшой PR к ревью. Если Swagger существенно увеличит объём,
      согласовать выделение в PR 1b; scope молча не расширять.
      Проверка: PR содержит назначение, связанный change, команды проверок и их
      результаты.

## Журнал согласований

- **Спецификация.** Согласована в PR #61 (Таня, Юра, Стас), просмотренная ревизия
  `7380d19`. Основание: `openspec/changes/archive/2026-11-27-add-auth-api/tasks.md`,
  журнал согласований. Повторно не пересматривается.
- **Тесты.** Ожидают ревью Стаса. Согласование не получено; реализация не начата.
- **Реализация.** Не начата.
