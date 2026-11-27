import { expect, it } from "vitest";

import { parseLoginMockConfig } from "./mock-config";

it("подставляет задержку по умолчанию, если она не задана", () => {
  const config = parseLoginMockConfig({
    result: "technical-error",
    delayMs: undefined,
  });

  expect(config).toEqual({
    ok: true,
    result: "technical-error",
    delayMs: 1500,
  });
});

it("считает пустую строку задержки ошибкой настройки", () => {
  const config = parseLoginMockConfig({
    result: "success",
    delayMs: "",
  });

  expect(config).toMatchObject({ ok: false });
});

it("подставляет результат по умолчанию, если он не задан", () => {
  const config = parseLoginMockConfig({
    result: undefined,
    delayMs: "3000",
  });

  expect(config).toEqual({
    ok: true,
    result: "success",
    delayMs: 3000,
  });
});

it("считает пустую строку результата ошибкой настройки", () => {
  const config = parseLoginMockConfig({
    result: "",
    delayMs: "3000",
  });

  expect(config).toMatchObject({ ok: false });
});

it("отклоняет неизвестный результат обработчика", () => {
  const config = parseLoginMockConfig({
    result: "succes",
    delayMs: "3000",
  });

  expect(config).toMatchObject({ ok: false });
});

it.each(["-1", "10001", "1.5", "abc"])(
  "отклоняет недопустимую задержку %s",
  (delayMs) => {
    const config = parseLoginMockConfig({
      result: "success",
      delayMs,
    });

    expect(config).toMatchObject({ ok: false });
  },
);

it.each([
  ["0", 0],
  ["10000", 10000],
] as const)("принимает допустимую задержку %s мс", (input, expected) => {
  const config = parseLoginMockConfig({
    result: "success",
    delayMs: input,
  });

  expect(config).toEqual({
    ok: true,
    result: "success",
    delayMs: expected,
  });
});
