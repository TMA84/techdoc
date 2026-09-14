import { LitElement, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { sharedStyles } from "./styles";
import { guarded } from "./errors";
import { createPlant } from "./ws";
import type { HomeAssistant, Plant, PlantType } from "./types";
import "./techdoc-status-badge";

function plantStatusBadge(plant: Plant) {
  const today = new Date().toISOString().slice(0, 10);
  if (plant.next_inspection && plant.next_inspection < today) {
    return html`<techdoc-status-badge status="overdue" label="Prüfung überfällig"></techdoc-status-badge>`;
  }
  if (plant.status === "kritisch") {
    return html`<techdoc-status-badge status="kritisch" label="Kritisch"></techdoc-status-badge>`;
  }
  if (plant.status === "auffaellig") {
    return html`<techdoc-status-badge status="hoch" label="Auffällig"></techdoc-status-badge>`;
  }
  return html`<techdoc-status-badge status="ok" label="OK"></techdoc-status-badge>`;
}

@customElement("techdoc-plant-list")
export class TechdocPlantList extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public plants: Plant[] = [];
  @property({ attribute: false }) public plantTypes: PlantType[] = [];
  @property({ type: Number }) public selectedPlantId: number | null = null;

  static styles = sharedStyles;

  private _plantTypeName(id: number): string {
    return this.plantTypes.find((pt) => pt.id === id)?.name ?? `Typ ${id}`;
  }

  private async _handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    await guarded(this, async () => {
      const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
      const plantTypeIdRaw = (form.elements.namedItem("plant_type_id") as HTMLSelectElement).value;
      if (!name) {
        throw new Error("Bitte einen Namen für die Anlage eingeben.");
      }
      if (!plantTypeIdRaw) {
        throw new Error("Bitte einen Anlagentyp auswählen.");
      }
      await createPlant(this.hass, name, parseInt(plantTypeIdRaw, 10));
      form.reset();
      this.dispatchEvent(new CustomEvent("plant-created", { bubbles: true, composed: true }));
    });
  }

  private _select(id: number) {
    this.dispatchEvent(
      new CustomEvent("plant-select", { detail: { id }, bubbles: true, composed: true })
    );
  }

  protected render() {
    return html`
      <div class="card">
        <h2>Anlagen</h2>
        ${this.plants.length
          ? html`
              ${this.plants.map(
                (plant) => html`
                  <div
                    class="row clickable"
                    @click=${() => this._select(plant.id)}
                    style=${plant.id === this.selectedPlantId
                      ? "background: var(--secondary-background-color, #f4f4f4); margin: 0 -20px; padding: 10px 20px;"
                      : ""}
                  >
                    <div class="row-main">
                      <span class="row-title">${plant.name}</span>
                      <span class="row-subtitle">
                        ${this._plantTypeName(plant.plant_type_id)}
                        ${plant.next_inspection ? html` · nächste Prüfung: ${plant.next_inspection}` : nothing}
                      </span>
                    </div>
                    <div class="row-actions">${plantStatusBadge(plant)}</div>
                  </div>
                `
              )}
            `
          : html`<p class="empty">Noch keine Anlagen angelegt.</p>`}

        <h3>Anlage anlegen</h3>
        ${this.plantTypes.length
          ? html`
              <form class="inline" @submit=${this._handleSubmit}>
                <input name="name" placeholder="Name der Anlage" required />
                <select name="plant_type_id" required>
                  ${this.plantTypes.map((pt) => html`<option value=${pt.id}>${pt.name}</option>`)}
                </select>
                <button type="submit">Anlegen</button>
              </form>
            `
          : html`<p class="empty">
              Keine Anlagentypen geladen — Integration neu laden oder Home-Assistant-Protokoll
              nach "techdoc" durchsuchen.
            </p>`}
      </div>
    `;
  }
}
