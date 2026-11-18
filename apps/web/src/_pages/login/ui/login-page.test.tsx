import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoginPage } from "./login-page";

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
  it("показывает ошибки обязательных полей при отправке пустой формы", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: "Войти" }));

    expect(screen.getAllByText("Обязательное поле")).toHaveLength(2);
  });
  it("показывает ошибку, если почта пустая, а пароль заполнен", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Пароль"), "secret");
    await user.click(screen.getByRole("button", { name: "Войти" }));

    expect(screen.getByText("Обязательное поле")).toBeInTheDocument();
  });
  it("показывает ошибку, если пароль пустой, а почта заполнена", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Почта"), "user@example.com");
    await user.click(screen.getByRole("button", { name: "Войти" }));

    expect(screen.getByText("Обязательное поле")).toBeInTheDocument();
  });
  it("показывает ошибку для почты неправильного формата", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Почта"), "userexample.com");
    await user.type(screen.getByLabelText("Пароль"), "secret");
    await user.click(screen.getByRole("button", { name: "Войти" }));

    expect(screen.getByText("Введите корректную почту")).toBeInTheDocument();
  });
  it("считает почту из пробелов пустой", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Почта"), "   ");
    await user.type(screen.getByLabelText("Пароль"), "secret");
    await user.click(screen.getByRole("button", { name: "Войти" }));

    expect(screen.getByText("Обязательное поле")).toBeInTheDocument();
  });
  it("убирает ошибку почты после ввода корректного адреса", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: "Войти" }));
    expect(screen.getAllByText("Обязательное поле")).toHaveLength(2);

    await user.type(screen.getByLabelText("Почта"), "user@example.com");

    expect(screen.queryByText("Обязательное поле")).not.toBeInTheDocument();
  });
  it("убирает ошибку пароля после его заполнения", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: "Войти" }));
    expect(screen.getAllByText("Обязательное поле")).toHaveLength(2);

    await user.type(screen.getByLabelText("Пароль"), "secret");

    const passwordField = screen.getByLabelText("Пароль");
    expect(passwordField.closest("div")?.parentElement).not.toHaveTextContent(
      "Обязательное поле",
    );
  });
  it("снова показывает ошибку, если исправленную почту сделать некорректной", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Почта"), "user@example.com");
    await user.type(screen.getByLabelText("Пароль"), "secret");
    await user.click(screen.getByRole("button", { name: "Войти" }));

    await user.clear(screen.getByLabelText("Почта"));
    await user.type(screen.getByLabelText("Почта"), "userexample.com");

    expect(screen.getByText("Введите корректную почту")).toBeInTheDocument();
  });
  it("снова показывает ошибку, если после исправления очистить пароль", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: "Войти" }));
    await user.type(screen.getByLabelText("Пароль"), "secret");

    const passwordField = screen.getByLabelText("Пароль");
    expect(passwordField.closest("div")?.parentElement).not.toHaveTextContent(
      "Обязательное поле",
    );

    await user.clear(passwordField);

    expect(screen.getByText("Обязательное поле")).toBeInTheDocument();
  });
  it("убирает ошибку формата почты после исправления адреса", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("Почта"), "userexample.com");
    await user.type(screen.getByLabelText("Пароль"), "secret");
    await user.click(screen.getByRole("button", { name: "Войти" }));

    expect(screen.getByText("Введите корректную почту")).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Почта"));
    await user.type(screen.getByLabelText("Почта"), "user@example.com");

    expect(
      screen.queryByText("Введите корректную почту"),
    ).not.toBeInTheDocument();
  });
});
