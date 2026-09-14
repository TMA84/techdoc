import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { sharedStyles } from "./styles";
import { guarded } from "./errors";
import { updateFindingStatus } from "./ws";
import type { Finding, HomeAssistant, Plant } from "./types";
import "./techdoc-status-badge";

@customElement("techdoc-findings-overview")
export class TechdocFindingsOverview extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public findings: Finding[] = [];
  @property({ attribute: false }) public plants: Plant[] = [];

  static styles = sharedStyles;

  private _plantName(id: number): string {
    return this.plants.find((p) => p.id === id)?.name ?? `Anlage ${id}`;
  }

  private async _close(id: number) {
    await guarded(this, async () => {
      await updateFindingStatus(this.hass, id, "erledigt", new Date().toISOString().slice(0, 10));
      this.dispatchEvent(new CustomEvent("techdoc-changed", { bubbles: true, composed: true }));
    });
  }

  protected render() {
    const open = this.findings.filter((f) => f.status === "offen");
    return html`
      <div class="card">
        <h2>Offene Mängel</h2>
        ${open.length
          ? open.map(
              (f) => html`
                <div class="row">
                  <div class="row-main">
                    <span class="row-title">${this._plantName(f.plant_id)}</span>
                    <span class="row-subtitle">${f.description} · ${f.date}</span>
                  </div>
                  <div class="row-actions">
                    <techdoc-status-badge status=${f.priority} label=${f.priority}></techdoc-status-badge>
                    <button class="secondary" @click=${() => this._close(f.id)}>Erledigt</button>
                  </div>
                </div>
              `
            )
          : html`<p class="empty">Keine offenen Mängel. 🟢</p>`}
      </div>
    `;
  }
}
