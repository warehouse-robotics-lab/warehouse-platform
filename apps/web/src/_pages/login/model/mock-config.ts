export function parseLoginMockConfig({
  result,
  delayMs,
}: {
  result: string | undefined;
  delayMs: string | undefined;
}) {
  const resolvedResult = result ?? "success";
  const rawDelay = delayMs ?? "1500";

  if (
    resolvedResult !== "success" &&
    resolvedResult !== "invalid-credentials" &&
    resolvedResult !== "technical-error"
  ) {
    return { ok: false } as const;
  }

  if (!/^\d+$/.test(rawDelay)) {
    return { ok: false } as const;
  }

  const delay = Number(rawDelay);

  if (delay > 10000) {
    return { ok: false } as const;
  }

  return { ok: true, result: resolvedResult, delayMs: delay } as const;
}
