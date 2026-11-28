export type LoginResult = "success" | "invalid-credentials" | "technical-error";

export type SubmitLogin = (credentials: {
  email: string;
  password: string;
}) => Promise<LoginResult>;

export function createMockSubmitLogin({
  result,
  delayMs,
}: {
  result: LoginResult;
  delayMs: number;
}): SubmitLogin {
  return () =>
    new Promise<LoginResult>((resolve) => {
      setTimeout(() => resolve(result), delayMs);
    });
}
