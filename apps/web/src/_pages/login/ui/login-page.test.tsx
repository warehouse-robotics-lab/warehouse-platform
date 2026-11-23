import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LoginPage } from "./login-page";
import { LoginForm } from "./login-form";

function expectFieldError(field: HTMLElement, message: string) {
  expect(field).toHaveAttribute("aria-invalid", "true");
  expect(field).toHaveAccessibleDescription(message);
}

function expectNoFieldError(field: HTMLElement) {
  expect(field).not.toHaveAttribute("aria-invalid", "true");
  expect(field).toHaveAccessibleDescription("");
}

describe("LoginPage", () => {
  it("показывает поля почты и пароля и кнопку входа", () => {
    render(<LoginPage />);

    expect(screen.getByLabelText("Почта")).toBeInTheDocument();
    expect(screen.getByLabelText("Пароль")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Войти" })).toBeInTheDocument();
  });

  it("не показывает ошибки полей до первой отправки", () => {
    render(<LoginPage />);

    expect(screen.queryByText("Обязательное поле")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Введите корректную почту"),
    ).not.toBeInTheDocument();
  });

  it("не показывает ошибку почты при уходе с поля до первой отправки", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailField = screen.getByLabelText("Почта");
    await user.type(emailField, "userexample.com");
    await user.tab();

    expectNoFieldError(emailField);
    expect(
      screen.queryByText("Введите корректную почту"),
    ).not.toBeInTheDocument();
  });

  it("показывает ошибки обязательных полей при отправке пустой формы", async () => {
    const user = userEvent.setup();
    const submitLogin = vi.fn(async () => "success" as const);
    render(<LoginForm submitLogin={submitLogin} onSuccess={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Войти" }));

    expect(screen.getAllByText("Обязательное поле")).toHaveLength(2);
    expect(screen.getByLabelText("Почта")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText("Пароль")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText("Почта")).toHaveAccessibleDescription(
      /Обязательное поле/,
    );
    expect(screen.getByLabelText("Пароль")).toHaveAccessibleDescription(
      /Обязательное поле/,
    );

    expect(submitLogin).not.toHaveBeenCalled();
  });

  it("показывает ошибку, если почта пустая, а пароль заполнен", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Пароль"), "secret");
    await user.click(screen.getByRole("button", { name: "Войти" }));

    expectFieldError(screen.getByLabelText("Почта"), "Обязательное поле");
    expectNoFieldError(screen.getByLabelText("Пароль"));
  });

  it("показывает ошибку, если пароль пустой, а почта заполнена", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Почта"), "user@example.com");
    await user.click(screen.getByRole("button", { name: "Войти" }));

    expectFieldError(screen.getByLabelText("Пароль"), "Обязательное поле");
    expectNoFieldError(screen.getByLabelText("Почта"));
  });

  it("показывает ошибку для почты неправильного формата", async () => {
    const user = userEvent.setup();
    const submitLogin = vi.fn(async () => "success" as const);
    render(<LoginForm submitLogin={submitLogin} onSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText("Почта"), "userexample.com");
    await user.type(screen.getByLabelText("Пароль"), "secret");
    await user.click(screen.getByRole("button", { name: "Войти" }));

    expectFieldError(
      screen.getByLabelText("Почта"),
      "Введите корректную почту",
    );
    expect(submitLogin).not.toHaveBeenCalled();
  });

  it("считает почту из пробелов пустой", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Почта"), "   ");
    await user.type(screen.getByLabelText("Пароль"), "secret");
    await user.click(screen.getByRole("button", { name: "Войти" }));

    expectFieldError(screen.getByLabelText("Почта"), "Обязательное поле");
    expectNoFieldError(screen.getByLabelText("Пароль"));
  });

  it("считает пароль из пробелов заполненным", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Пароль"), "   ");
    await user.click(screen.getByRole("button", { name: "Войти" }));

    expectFieldError(screen.getByLabelText("Почта"), "Обязательное поле");
    expectNoFieldError(screen.getByLabelText("Пароль"));
  });

  it("убирает ошибку почты после ввода корректного адреса", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: "Войти" }));
    expect(screen.getAllByText("Обязательное поле")).toHaveLength(2);

    await user.type(screen.getByLabelText("Почта"), "user@example.com");

    expectNoFieldError(screen.getByLabelText("Почта"));
    expectFieldError(screen.getByLabelText("Пароль"), "Обязательное поле");
  });

  it("убирает ошибку пароля после его заполнения", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: "Войти" }));
    expect(screen.getAllByText("Обязательное поле")).toHaveLength(2);

    await user.type(screen.getByLabelText("Пароль"), "secret");

    const passwordField = screen.getByLabelText("Пароль");
    expectNoFieldError(passwordField);
    expectFieldError(screen.getByLabelText("Почта"), "Обязательное поле");
  });

  it("снова показывает ошибку, если исправленную почту сделать некорректной", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Почта"), "user@example.com");
    await user.click(screen.getByRole("button", { name: "Войти" }));

    await user.clear(screen.getByLabelText("Почта"));
    await user.type(screen.getByLabelText("Почта"), "userexample.com");

    expectFieldError(
      screen.getByLabelText("Почта"),
      "Введите корректную почту",
    );
  });

  it("снова показывает ошибку, если после исправления очистить пароль", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: "Войти" }));
    await user.type(screen.getByLabelText("Пароль"), "secret");

    const passwordField = screen.getByLabelText("Пароль");
    expectNoFieldError(passwordField);

    await user.clear(passwordField);

    expectFieldError(passwordField, "Обязательное поле");
  });

  it("убирает ошибку формата почты после исправления адреса", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Почта"), "userexample.com");
    await user.type(screen.getByLabelText("Пароль"), "secret");
    await user.click(screen.getByRole("button", { name: "Войти" }));

    expectFieldError(
      screen.getByLabelText("Почта"),
      "Введите корректную почту",
    );

    await user.clear(screen.getByLabelText("Почта"));
    await user.type(screen.getByLabelText("Почта"), "user@example.com");

    expectNoFieldError(screen.getByLabelText("Почта"));
  });

  it("не отправляет форму повторно в ожидании и вызывает onSuccess один раз без аргументов после успеха", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    let finishSubmit!: (result: "success") => void;
    const pendingSubmit = new Promise<"success">((resolve) => {
      finishSubmit = resolve;
    });
    const submitLogin = vi.fn(() => pendingSubmit);

    render(<LoginForm submitLogin={submitLogin} onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText("Почта"), "User@Example.COM");
    await user.type(screen.getByLabelText("Пароль"), "  SeCrEt  ");
    const submitButton = screen.getByRole("button", { name: "Войти" });

    await user.click(submitButton);

    expect(submitButton).toBeDisabled();

    await user.click(submitButton);
    await user.click(screen.getByLabelText("Почта"));
    await user.keyboard("{Enter}");

    expect(submitLogin.mock.calls).toEqual([
      [{ email: "user@example.com", password: "  SeCrEt  " }],
    ]);
    expect(onSuccess).not.toHaveBeenCalled();

    finishSubmit("success");

    await vi.waitFor(
      () => {
        expect(submitButton).toBeEnabled();
        expect(onSuccess.mock.calls).toEqual([[]]);
      },
      { timeout: 3000 },
    );
  });

  it("блокирует кнопку во время отправки и разблокирует после ответа", async () => {
    const user = userEvent.setup();

    let finishSubmit!: (result: "success") => void;
    const pendingSubmit = new Promise<"success">((resolve) => {
      finishSubmit = resolve;
    });
    const submitLogin = vi.fn(() => pendingSubmit);

    render(<LoginForm submitLogin={submitLogin} onSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText("Почта"), "user@example.com");
    await user.type(screen.getByLabelText("Пароль"), "secret");
    const submitButton = screen.getByRole("button", { name: "Войти" });
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveAccessibleName("Войти");
    expect(submitButton).toHaveAttribute("aria-busy", "true");

    expect(
      submitButton.querySelector('[data-testid="login-submit-spinner"]'),
    ).toBeVisible();

    expect(screen.getByLabelText("Почта")).toHaveAttribute("readonly");
    expect(screen.getByLabelText("Пароль")).toHaveAttribute("readonly");

    finishSubmit("success");

    await vi.waitFor(
      () => {
        expect(submitButton).toBeEnabled();
      },
      { timeout: 3000 },
    );

    expect(screen.getByLabelText("Почта")).not.toHaveAttribute("readonly");
    expect(screen.getByLabelText("Пароль")).not.toHaveAttribute("readonly");
    expect(submitButton).not.toHaveAttribute("aria-busy", "true");
    expect(submitButton).toHaveTextContent(/^Войти$/);

    const spinnerAfterSubmit = submitButton.querySelector(
      '[data-testid="login-submit-spinner"]',
    );

    if (spinnerAfterSubmit !== null) {
      expect(spinnerAfterSubmit).not.toBeVisible();
    }
  });

  it("показывает общее сообщение при неверных учётных данных", async () => {
    const user = userEvent.setup();

    let finishRetry!: (result: "invalid-credentials") => void;
    const pendingRetry = new Promise<"invalid-credentials">((resolve) => {
      finishRetry = resolve;
    });

    const submitLogin = vi
      .fn<() => Promise<"invalid-credentials">>()
      .mockResolvedValueOnce("invalid-credentials")
      .mockReturnValueOnce(pendingRetry);

    render(<LoginForm submitLogin={submitLogin} onSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText("Почта"), "user@example.com");
    await user.type(screen.getByLabelText("Пароль"), "secret");
    await user.click(screen.getByRole("button", { name: "Войти" }));

    const errorMessage = await screen.findByText(
      "Неверная почта или пароль",
      {},
      { timeout: 3000 },
    );

    expect(errorMessage).toBeVisible();
    expect(errorMessage.closest('[aria-live="polite"]')).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Войти" })).toBeEnabled();

    await user.type(screen.getByLabelText("Пароль"), "2");
    expect(screen.getByText("Неверная почта или пароль")).toBeVisible();

    await user.clear(screen.getByLabelText("Пароль"));
    await user.click(screen.getByRole("button", { name: "Войти" }));

    await user.clear(screen.getByLabelText("Пароль"));
    await user.click(screen.getByRole("button", { name: "Войти" }));

    expect(screen.getByText("Неверная почта или пароль")).toBeVisible();
    expect(submitLogin).toHaveBeenCalledTimes(1);

    expectFieldError(screen.getByLabelText("Пароль"), "Обязательное поле");

    await user.type(screen.getByLabelText("Пароль"), "secret");

    expect(screen.getByText("Неверная почта или пароль")).toBeVisible();

    await user.type(screen.getByLabelText("Пароль"), "secret");
    await user.click(screen.getByRole("button", { name: "Войти" }));

    expect(
      screen.queryByText("Неверная почта или пароль"),
    ).not.toBeInTheDocument();

    finishRetry("invalid-credentials");

    expect(
      await screen.findByText(
        "Неверная почта или пароль",
        {},
        { timeout: 3000 },
      ),
    ).toBeVisible();
  });

  it("показывает общее сообщение при технической ошибке", async () => {
    const user = userEvent.setup();

    const submitLogin = vi.fn(async () => "technical-error" as const);

    render(<LoginForm submitLogin={submitLogin} onSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText("Почта"), "user@example.com");
    await user.type(screen.getByLabelText("Пароль"), "secret");
    await user.click(screen.getByRole("button", { name: "Войти" }));

    expect(
      await screen.findByText(
        "Не удалось войти. Попробуйте ещё раз.",
        {},
        { timeout: 3000 },
      ),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Войти" })).toBeEnabled();
  });

  it("показывает техническую ошибку и выходит из ожидания, если отправка отклонена", async () => {
    const user = userEvent.setup();

    let rejectSubmit!: (error: Error) => void;
    const pendingSubmit = new Promise<never>((_, reject) => {
      rejectSubmit = reject;
    });
    const submitLogin = vi.fn(() => pendingSubmit);

    render(<LoginForm submitLogin={submitLogin} onSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText("Почта"), "user@example.com");
    await user.type(screen.getByLabelText("Пароль"), "secret");

    const submitButton = screen.getByRole("button", { name: "Войти" });
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();

    rejectSubmit(new Error("Сбой отправки"));

    expect(
      await screen.findByText("Не удалось войти. Попробуйте ещё раз."),
    ).toBeVisible();
    expect(submitButton).toBeEnabled();
  });

  it("показывает ошибку настройки и не отправляет форму", async () => {
    const user = userEvent.setup();
    const submitLogin = vi.fn(async () => "success" as const);
    const onSuccess = vi.fn();
    const configurationError =
      "Ошибка настройки тестового обработчика. Проверьте настройки разработки.";

    render(
      <LoginForm
        submitLogin={submitLogin}
        onSuccess={onSuccess}
        configurationError={configurationError}
      />,
    );

    expect(screen.getByText(configurationError)).toBeVisible();

    await user.type(screen.getByLabelText("Почта"), "user@example.com");
    await user.type(screen.getByLabelText("Пароль"), "secret");
    await user.click(screen.getByRole("button", { name: "Войти" }));

    expect(submitLogin).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
