import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

const SEVERITY_ICON: Record<string, string> = {
  ok: "🟢",
  info: "⚪",
  niedrig: "🔵",
  mittel: "🟡",
  hoch: "🟠",
  kritisch: "🔴",
  due: "🟡",
  overdue: "🔴",
};

/** Small colored pill for plant/anomaly/finding status, self-contained so it
 * renders consistently regardless of which shadow root it is used from. */
@customElement("techdoc-status-badge")
export class TechdocStatusBadge extends LitElement {
  @property() public status = "info";
  @property() public label = "";

  static styles = css`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 500;
      white-space: nowrap;
    }
    .ok { background: #e3f6e8; color: #1e7e34; }
    .info { background: #eef0f2; color: #5f6a72; }
    .niedrig { background: #e5f0fb; color: #1565c0; }
    .mittel { background: #fff6d9; color: #9a7d0a; }
    .hoch { background: #ffe9d6; color: #b25a00; }
    .kritisch { background: #fde1e1; color: #c62828; }
    .due { background: #fff6d9; color: #9a7d0a; }
    .overdue { background: #fde1e1; color: #c62828; }
  `;

  protected render() {
    return html`
      <span class="badge ${this.status}">${SEVERITY_ICON[this.status] ?? ""} ${this.label}</span>
    `;
  }
}
