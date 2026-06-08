// Lightweight client-side error reporter. Logs to the console only; swap in
// a real telemetry provider here if you ever want to forward errors.

export function reportClientError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line no-console
  console.error("[client-error]", error, context);
}
