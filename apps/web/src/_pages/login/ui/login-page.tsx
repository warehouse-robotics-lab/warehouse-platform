import { Button } from "@/shared/ui/button";
import { LoginHeader } from "./login-header";

export function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 text-slate-900">
      <LoginHeader />
      <main className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-4 py-8 text-slate-900">
        <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6">
          <h1 className="mb-6 w-full max-w-sm text-2xl font-semibold">Вход</h1>
          <form className="flex w-full max-w-sm flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Почта
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="example@example.com"
                className="h-11 rounded-md border border-slate-400 px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="h-11 rounded-md border border-slate-400 px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              />
            </div>
            <Button
              type="button"
              className="h-11 w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              Войти
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
