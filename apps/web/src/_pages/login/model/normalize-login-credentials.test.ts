import { expect, it } from "vitest";

import { normalizeLoginCredentials } from "./normalize-login-credentials";

it("убирает пробелы по краям почты и сохраняет пароль без изменений", () => {
  const credentials = normalizeLoginCredentials({
    email: "  User@example.com  ",
    password: "  secret  ",
  });

  expect(credentials).toEqual({
    email: "user@example.com",
    password: "  secret  ",
  });
});
