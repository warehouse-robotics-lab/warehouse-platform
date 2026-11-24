"use client";

import { LoginHeader } from "./login-header";
import { LoginForm } from "./login-form";
import { parseLoginMockConfig } from "../model/mock-config";
import { createMockSubmitLogin } from "../api/mock-submit-login";

export function LoginPage() {
  const config = parseLoginMockConfig({
    result: process.env.NEXT_PUBLIC_LOGIN_MOCK_RESULT,
    delayMs: process.env.NEXT_PUBLIC_LOGIN_MOCK_DELAY_MS,
  });
  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 text-slate-900">
      <LoginHeader />
      <main className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-4 py-8 text-slate-900">
        <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6">
          <h1 className="mb-6 w-full max-w-sm text-2xl font-semibold">Вход</h1>
          <LoginForm
            submitLogin={
              config.ok
                ? createMockSubmitLogin(config)
                : async () => "technical-error"
            }
            onSuccess={() => {}}
            configurationError={
              config.ok
                ? undefined
                : "Ошибка настройки тестового обработчика. Проверьте настройки разработки."
            }
          />
        </div>
      </main>
    </div>
  );
}
