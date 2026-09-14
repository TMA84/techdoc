/**
 * Every mutating action funnels through this so a failed websocket call (or
 * thrown JS error) always surfaces to the user as a visible banner instead
 * of silently doing nothing — the original vanilla-JS panel had no such
 * handling, which made backend/validation errors invisible.
 */
export async function guarded(el: HTMLElement, action: () => Promise<void>): Promise<void> {
  try {
    await action();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    el.dispatchEvent(
      new CustomEvent("techdoc-error", { detail: { message }, bubbles: true, composed: true })
    );
  }
}
