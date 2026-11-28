import { expect, it, vi } from "vitest";

import { createMockSubmitLogin } from "./mock-submit-login";

it("возвращает настроенный результат только после заданной задержки", async () => {
  vi.useFakeTimers();

  try {
    const submitLogin = createMockSubmitLogin({
      result: "invalid-credentials",
      delayMs: 1500,
    });

    const onResult = vi.fn();
    void submitLogin({
      email: "user@example.com",
      password: "secret",
    }).then(onResult);

    await vi.advanceTimersByTimeAsync(1499);
    expect(onResult).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(onResult).toHaveBeenCalledWith("invalid-credentials");
  } finally {
    vi.useRealTimers();
  }
});
