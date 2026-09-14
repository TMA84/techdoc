/**
 * Every mutating action funnels through this so a failed websocket call (or
 * thrown JS error) always surfaces to the user as a visible banner instead
 * of silently doing nothing — the original vanilla-JS panel had no such
 * handling, which made backend/validation errors invisible.
 */
/** Home Assistant's `hass.callWS` rejects with `{code, message}` on a
 * websocket `send_error`, not a native Error — so a plain `instanceof Error`
 * check misses it and would print "[object Object]". */
function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err && typeof (err as any).message === "string") {
    return (err as { message: string }).message;
  }
  return String(err);
}

export async function guarded(el: HTMLElement, action: () => Promise<void>): Promise<void> {
  try {
    await action();
  } catch (err) {
    el.dispatchEvent(
      new CustomEvent("techdoc-error", {
        detail: { message: errorMessage(err) },
        bubbles: true,
        composed: true,
      })
    );
  }
}
