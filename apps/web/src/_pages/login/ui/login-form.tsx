"use client";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import type { SubmitLogin } from "../api/mock-submit-login";
import { normalizeLoginCredentials } from "../model/normalize-login-credentials";
import { useState, useSyncExternalStore } from "react";
import { loginSchema } from "../model/login-schema";
import { useForm } from "react-hook-form";

type LoginFormProps = {
  submitLogin: SubmitLogin;
  onSuccess: () => void;
  configurationError?: string;
};

function getEmailError(email: string): string | undefined {
  const result = loginSchema.shape.email.safeParse(email);

  return result.success ? undefined : result.error.issues[0]?.message;
}

const subscribeToReadiness = () => () => {};

export function LoginForm({
  submitLogin,
  onSuccess,
  configurationError,
}: LoginFormProps) {
  const form = useForm<{ email: string; password: string }>({
    defaultValues: { email: "", password: "" },
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>(undefined);

  const emailField = form.register("email");
  const passwordField = form.register("password");
  const isReady = useSyncExternalStore(
    subscribeToReadiness,
    () => true,
    () => false,
  );
  return (
    <form
      noValidate
      className="flex w-full max-w-sm flex-col gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        if (configurationError || isSubmitting) {
          return;
        }
        setHasSubmitted(true);
        const { email, password } = form.getValues();
        const credentials = normalizeLoginCredentials({ email, password });
        const result = loginSchema.safeParse(credentials);
        const nextErrors: typeof errors = {};

        if (!result.success) {
          const { fieldErrors } = result.error.flatten();
          nextErrors.email = fieldErrors.email?.[0];
          nextErrors.password = fieldErrors.password?.[0];
        }

        setErrors(nextErrors);
        if (!result.success) {
          return;
        }
        setSubmitError(undefined);
        setIsSubmitting(true);

        try {
          const result = await submitLogin(credentials);

          if (result === "success") {
            onSuccess();
          } else if (result === "invalid-credentials") {
            setSubmitError("Неверная почта или пароль");
          } else if (result === "technical-error") {
            setSubmitError("Не удалось войти. Попробуйте ещё раз.");
          }
        } catch {
          setSubmitError("Не удалось войти. Попробуйте ещё раз.");
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium">
          Почта
        </label>
        <Input
          id="email"
          {...emailField}
          type="email"
          autoComplete="username"
          placeholder="example@example.com"
          className="h-11 rounded-md border border-slate-400 px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
          onChange={(event) => {
            void emailField.onChange(event);
            if (!hasSubmitted) {
              return;
            }

            const email = event.currentTarget.value.trim().toLowerCase();
            setErrors((previous) => ({
              ...previous,
              email: getEmailError(email),
            }));
          }}
          disabled={!isReady}
          readOnly={isSubmitting}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-red-600">
            {errors.email}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium">
          Пароль
        </label>
        <Input
          id="password"
          {...passwordField}
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className="h-11 rounded-md border border-slate-400 px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? "password-error" : undefined}
          onChange={(event) => {
            void passwordField.onChange(event);
            if (!hasSubmitted) {
              return;
            }

            const password = event.currentTarget.value;
            const result = loginSchema.shape.password.safeParse(password);

            setErrors((previous) => ({
              ...previous,
              password: result.success
                ? undefined
                : result.error.issues[0]?.message,
            }));
          }}
          disabled={!isReady}
          readOnly={isSubmitting}
        />
        {errors.password && (
          <p id="password-error" className="text-sm text-red-600">
            {errors.password}
          </p>
        )}
      </div>
      <p className="min-h-10 text-sm text-red-600" aria-live="polite">
        {configurationError ?? submitError}
      </p>
      <Button
        type="submit"
        disabled={!isReady || isSubmitting}
        aria-busy={isSubmitting ? true : undefined}
        className="h-11 w-full bg-blue-600 text-white hover:bg-blue-700"
      >
        {isSubmitting && (
          <span
            aria-hidden="true"
            data-testid="login-submit-spinner"
            className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          />
        )}
        <span className={isSubmitting ? "sr-only" : undefined}>Войти</span>
      </Button>
    </form>
  );
}
