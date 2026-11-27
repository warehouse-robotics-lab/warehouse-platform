# Матрица «Scenario → тест»

Матрица связывает только сценарии, которые проверяет Change 1: схемы, правила полей,
структуру ошибок и документацию OpenAPI. Поведение B1–B9 и F1–F7 в Change 1 не
реализуется и не тестируется; оно перечислено отдельно в разделе «Вне Change 1» без
тестов.

Это план ревью: тестовые файлы создаются на этапе apply (задачи 2.1–2.2) и до
согласования тестов реализация не начинается. Имена тестов ниже — контракт для будущих
файлов.

## Change 1: схемы и правила

| Scenario | Тест |
| --- | --- |
| Допустимые значения регистрации | `register-validation.test.ts` → `accepts a valid registration and returns normalized data` |
| Допустимые значения входа | `login-validation.test.ts` → `accepts valid credentials and normalizes email` |
| Граница пароля: 8 кодовых точек | `register-validation.test.ts` → `accepts a password of exactly 8 code points` |
| Граница пароля: 36 кодовых точек | `register-validation.test.ts` → `accepts a password of exactly 36 code points` |
| Пароль короче минимума | `register-validation.test.ts` → `rejects a password of 7 code points with PASSWORD_TOO_SHORT` |
| Пароль длиннее максимума | `register-validation.test.ts` → `rejects a password of 37 code points with PASSWORD_TOO_LONG` |
| Unicode-граница пароля | `register-validation.test.ts` → `accepts a password longer than 36 UTF-16 units but 36 code points` |
| Состав пароля: без цифры | `register-validation.test.ts` → `rejects a password without a digit` |
| Состав пароля: без заглавной буквы | `register-validation.test.ts` → `rejects a password without an uppercase letter` |
| Состав пароля: без строчной буквы | `register-validation.test.ts` → `rejects a password without a lowercase letter` |
| Состав пароля: без специального символа | `register-validation.test.ts` → `rejects a password without a special character` |
| Пробел не заменяет специальный символ | `register-validation.test.ts` → `does not treat a space as a special character` |
| Пароль не изменяется | `register-validation.test.ts` → `preserves leading and trailing spaces in the password`; `login-validation.test.ts` → `preserves the password exactly` |
| Нормализация email | `register-validation.test.ts` → `normalizes email edge spaces and case`; `login-validation.test.ts` → `normalizes email edge spaces` |
| Email без символа @ | `register-validation.test.ts` → `rejects an email without @`; `login-validation.test.ts` → `rejects an email without @` |
| Email с несколькими @ | `register-validation.test.ts` → `rejects an email with more than one @`; `login-validation.test.ts` → `rejects an email with more than one @` |
| Email с пробелом внутри | `register-validation.test.ts` → `rejects an email with an inner space` |
| Пустой email | `register-validation.test.ts` → `returns only REQUIRED for empty field values` |
| Слишком длинный email | `register-validation.test.ts` → `rejects an email of 255 code points`; `login-validation.test.ts` → `rejects an email longer than 254 code points` |
| Граница email: 254 кодовых точки | `register-validation.test.ts` → `accepts an email of exactly 254 code points` |
| Домен без точки | `register-validation.test.ts` → `accepts an email without a dot in the domain` |
| Имя короче минимума | `register-validation.test.ts` → `rejects a name of 1 code point` |
| Пустое имя | `register-validation.test.ts` → `returns only REQUIRED for empty field values` |
| Имя длиннее максимума | `register-validation.test.ts` → `rejects a name of 65 code points` |
| Граница имени: 2 и 64 кодовых точки | `register-validation.test.ts` → `accepts a name of exactly 2 code points`; `accepts a name of exactly 64 code points` |
| Unicode-граница имени | `register-validation.test.ts` → `accepts an astral name of 64 code points` |
| Имя с крайними пробелами | `register-validation.test.ts` → `trims name edges and preserves inner spaces` |
| Различие login и register: пароль | `login-validation.test.ts` → `accepts a password that violates registration complexity`; `accepts a 37-code-point password`; `register-validation.test.ts` → `returns PASSWORD_TOO_SHORT and PASSWORD_WEAK in canonical order` |
| Различие login и register: имя | `register-validation.test.ts` → `rejects a name of 1 code point`; `login-validation.test.ts` → `rejects an extra name field` |
| Пустое тело | `register-validation.test.ts` → `treats an empty body as missing fields`; `login-validation.test.ts` → `treats an empty body as missing fields` |
| Отсутствующее обязательное поле | `register-validation.test.ts` → `treats an empty object as missing fields` |
| Пустое значение поля | `register-validation.test.ts` → `returns only REQUIRED for empty field values`; `login-validation.test.ts` → `returns only REQUIRED for empty values` |
| Неверный тип поля | `register-validation.test.ts` → `rejects a missing field of the wrong type`; `login-validation.test.ts` → `rejects a non-string email`; `rejects a non-string password` |
| Тело не является объектом | `register-validation.test.ts` → `rejects a non-object body`; `login-validation.test.ts` → `rejects a non-object body` |
| Лишнее поле в теле | `register-validation.test.ts` → `rejects an extra field`; `login-validation.test.ts` → `rejects an extra name field` |
| Пароль нарушает несколько правил | `register-validation.test.ts` → `returns PASSWORD_TOO_SHORT and PASSWORD_WEAK in canonical order`; `returns PASSWORD_TOO_LONG and PASSWORD_WEAK in canonical order` |
| Несколько неверных полей | `register-validation.test.ts` → `returns all invalid fields in the documented shape` |
| Код нарушения поля известен клиенту | `field-rules.test.ts` → `orderFieldCodes returns the canonical order` |
| Порядок кодов в поле | `register-validation.test.ts` → `returns PASSWORD_TOO_SHORT and PASSWORD_WEAK in canonical order`; `error-contract.test.ts` → `createErrorResponse sorts field codes` |
| Ошибка без привязки к полю | `error-contract.test.ts` → `createErrorResponse returns code and message without fields for INVALID_CREDENTIALS` |
| Ошибка с привязкой к полю | `error-contract.test.ts` → `createErrorResponse sorts field codes` |
| Одинаковый текст для одного кода | `error-contract.test.ts` → `every top-level code message matches the catalog` |
| Сообщение соответствует справочнику | `error-contract.test.ts` → `every top-level code message matches the catalog` |
| Ответ не содержит пароль | `error-contract.test.ts` → `rejects a user object with a password`; `serializes user responses without password` |
| Состав объекта пользователя | `error-contract.test.ts` → `accepts a valid user object`; `requires createdAt in UTC ISO 8601`; `rejects createdAt with a non-Z offset` |
| Неверные учётные данные без кодов нарушений | `error-contract.test.ts` → `createErrorResponse returns code and message without fields for INVALID_CREDENTIALS` |
| Ответ регистрации содержит код нарушения | `register-validation.test.ts` → `returns all invalid fields in the documented shape` |
| Клиентская и серверная проверки совпадают | `field-rules.test.ts` → `constants match the agreed limits`; `error-contract.test.ts` → `exposes exactly one message per error code` |

## Change 1: документация OpenAPI

Тесты этого раздела проверяют только документ. Они не проверяют поведение Redis,
сессий, лимитов, CSRF или обработчиков; владелец поведения указан отдельно.

| Что документируется | Тест | Владелец поведения |
| --- | --- | --- |
| Четыре адреса и методы | `auth-openapi.spec.ts` → `documents exactly the four auth paths and methods` | — |
| Схемы запросов из `@warehouse/contracts` | `auth-openapi.spec.ts` → `uses the request schemas from @warehouse/contracts` | Change 1 |
| Схема успешного ответа пользователя | `auth-openapi.spec.ts` → `uses the success response schema from @warehouse/contracts` | Change 1 |
| Схемы ошибок из `@warehouse/contracts` | `auth-openapi.spec.ts` → `uses the error response schemas from @warehouse/contracts` | Change 1 |
| `POST /auth/logout` без тела | `auth-openapi.spec.ts` → `documents logout without a request body` | Change 1 |
| Статусы регистрации | `auth-openapi.spec.ts` → `documents all register responses` | B6, B9, B4, B2 |
| Статусы входа | `auth-openapi.spec.ts` → `documents all login responses` | B7, B9, B4, B2 |
| Статусы выхода | `auth-openapi.spec.ts` → `documents all logout responses` | B8, B4, B2 |
| Статусы текущего пользователя | `auth-openapi.spec.ts` → `documents all current user responses` | B8, B4, B2 |
| `Cache-Control: no-store` | `auth-openapi.spec.ts` → `adds Cache-Control no-store to every response` | B2, B8 |
| `Retry-After` у `429` | `auth-openapi.spec.ts` → `adds Retry-After to 429 responses` | B9 |
| `Allow` у `405` | `auth-openapi.spec.ts` → `adds Allow to 405 responses` | B2 |
| `Set-Cookie` у успешных `201`/`200` | `auth-openapi.spec.ts` → `adds Set-Cookie to successful register and login` | B4 |
| Пометка «контракт без реализации» | `auth-openapi.spec.ts` → `marks operations as contract-only` | Change 1 |
| Схемы компонентов из Zod | `auth-openapi.spec.ts` → `generates component schemas from the Zod contracts` | Change 1 |

## Вне Change 1

Эти сценарии не имеют тестов в Change 1. Они реализуются и проверяются в указанных
изменениях.

| Сценарий или область | Владелец |
| --- | --- |
| Redis, конфигурация, CORS/preflight, `TRUSTED_ORIGINS` | B1 |
| Фильтр ошибок, разбор тела и `Content-Type`, CSRF, публичные адреса и guard | B2, B5 |
| Хеширование, проверка пароля, фиктивная проверка, перехеширование, журнал без пароля | B3 |
| Сессии, cookie, сроки, продление, перевыдача, завершение, межпроцессные сценарии | B4, B5 |
| Обработчики `register`/`login`/`logout`/`current`, занятость email, порядок проверок, конкурентная регистрация | B6, B7, B8 |
| Счётчики, окна, блокировки, `Retry-After` как поведение | B9 |
| Формы, клиентская проверка, транспорт Web → API | F1–F7 |
| ts-rest/tRPC, топология развёртывания | Вне Change 1 |

## Проверки потребителей

| Проверка | Способ |
| --- | --- |
| API импортирует публичные экспорты | `pnpm --filter @warehouse/api typecheck` и `pnpm --filter @warehouse/api build` |
| Web импортирует публичные экспорты | `pnpm --filter @warehouse/web typecheck` и `pnpm --filter @warehouse/web build` |
| Правила не дублируются | Проверка diff: API и Web используют только импорты из `@warehouse/contracts`; `auth-openapi.spec.ts` → `generates component schemas from the Zod contracts` |
| OpenAPI генерируется из тех же схем | `auth-openapi.spec.ts` → `uses the request schemas from @warehouse/contracts`; `uses the success response schema from @warehouse/contracts`; `uses the error response schemas from @warehouse/contracts` |
| Документация не выдаётся за реализацию | `auth-openapi.spec.ts` → `marks operations as contract-only` |
| Версии и lockfile | Проверка diff: версии TypeScript, ESLint и Zod — из проекта; `@nestjs/swagger` совместим с Nest 11; `pnpm-lock.yaml` обновлён общим `pnpm install` |
