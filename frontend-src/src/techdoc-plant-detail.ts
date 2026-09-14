import { LitElement, html, nothing, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles } from "./styles";
import { guarded } from "./errors";
import {
  completeInspection,
  createFinding,
  createInspection,
  deleteSensorMapping,
  fetchAnomalies,
  fetchDocuments,
  fetchInspections,
  fetchFindings,
  fetchPlantMetricYearly,
  fetchSensorMappings,
  generateInspectionReport,
  updateAnomalyStatus,
  uploadDocument,
  upsertSensorMapping,
} from "./ws";
import type {
  Anomaly,
  DocumentRecord,
  Finding,
  HomeAssistant,
  Inspection,
  MetricCatalogue,
  Plant,
  SensorMapping,
  YearlyTotalsResult,
} from "./types";
import "./techdoc-status-badge";

function notifyChanged(el: HTMLElement) {
  el.dispatchEvent(new CustomEvent("techdoc-changed", { bubbles: true, composed: true }));
}

@customElement("techdoc-plant-detail")
export class TechdocPlantDetail extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public plant!: Plant;
  @property({ attribute: false }) public metricCatalogue: MetricCatalogue = {};
  @property() public plantTypeKey = "";

  @state() private _inspections: Inspection[] = [];
  @state() private _findings: Finding[] = [];
  @state() private _sensorMappings: SensorMapping[] = [];
  @state() private _anomalies: Anomaly[] = [];
  @state() private _documents: DocumentRecord[] = [];
  @state() private _yearlyTotals: YearlyTotalsResult | null = null;
  @state() private _yearlyTotalsMetricKey: string | null = null;

  static styles = sharedStyles;

  protected willUpdate(changed: PropertyValues) {
    if (changed.has("plant") && this.plant) {
      const previous = changed.get("plant") as Plant | undefined;
      if (!previous || previous.id !== this.plant.id) {
        this._yearlyTotals = null;
        this._yearlyTotalsMetricKey = null;
        void this._load();
      }
    }
  }

  private async _load() {
    const plantId = this.plant.id;
    const [inspections, findings, sensorMappings, anomalies, documents] = await Promise.all([
      fetchInspections(this.hass, plantId),
      fetchFindings(this.hass, plantId),
      fetchSensorMappings(this.hass, plantId),
      fetchAnomalies(this.hass, plantId, "offen"),
      fetchDocuments(this.hass, plantId),
    ]);
    this._inspections = inspections;
    this._findings = findings;
    this._sensorMappings = sensorMappings;
    this._anomalies = anomalies;
    this._documents = documents;
  }

  private async _handleCreateInspection(event: SubmitEvent) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    await guarded(this, async () => {
      const type = (form.elements.namedItem("type") as HTMLInputElement).value.trim() || "sonstige";
      const inspector = (form.elements.namedItem("inspector") as HTMLInputElement).value.trim();
      await createInspection(
        this.hass,
        this.plant.id,
        new Date().toISOString().slice(0, 10),
        type,
        inspector || undefined
      );
      form.reset();
      await this._load();
      notifyChanged(this);
    });
  }

  private async _handleCompleteInspection(id: number) {
    await guarded(this, async () => {
      await completeInspection(this.hass, id);
      await this._load();
      notifyChanged(this);
    });
  }

  private async _handleGenerateReport(id: number) {
    await guarded(this, async () => {
      await generateInspectionReport(this.hass, id);
      await this._load();
    });
  }

  private async _handleCreateFinding(event: SubmitEvent) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    await guarded(this, async () => {
      const description = (form.elements.namedItem("description") as HTMLInputElement).value.trim();
      const priority = (form.elements.namedItem("priority") as HTMLSelectElement).value;
      if (!description) {
        throw new Error("Bitte eine Beschreibung für den Mangel eingeben.");
      }
      await createFinding(
        this.hass,
        this.plant.id,
        description,
        new Date().toISOString().slice(0, 10),
        priority
      );
      form.reset();
      await this._load();
      notifyChanged(this);
    });
  }

  private async _handleAddSensorMapping(event: SubmitEvent) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    await guarded(this, async () => {
      const metricKey = (form.elements.namedItem("metric_key") as HTMLInputElement).value.trim();
      const entityId = (form.elements.namedItem("entity_id") as HTMLInputElement).value.trim();
      const aggregation = (form.elements.namedItem("aggregation") as HTMLSelectElement).value;
      if (!metricKey || !entityId) {
        throw new Error("Bitte Kennzahl und Entity-ID angeben.");
      }
      const catalogueEntry = this._currentMetricOptions().find((m) => m.key === metricKey);
      await upsertSensorMapping(
        this.hass,
        this.plant.id,
        metricKey,
        entityId,
        catalogueEntry?.unit ?? undefined,
        aggregation
      );
      form.reset();
      await this._load();
    });
  }

  private async _handleDeleteSensorMapping(id: number) {
    await guarded(this, async () => {
      await deleteSensorMapping(this.hass, id);
      await this._load();
    });
  }

  private async _handleShowYearly(metricKey: string) {
    await guarded(this, async () => {
      this._yearlyTotalsMetricKey = metricKey;
      this._yearlyTotals = await fetchPlantMetricYearly(this.hass, this.plant.id, metricKey);
    });
  }

  private async _handleAnomalyStatus(id: number, status: string) {
    await guarded(this, async () => {
      await updateAnomalyStatus(this.hass, id, status);
      await this._load();
    });
  }

  private async _handleUpload(event: SubmitEvent) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    await guarded(this, async () => {
      const fileInput = form.elements.namedItem("file") as HTMLInputElement;
      const docType = (form.elements.namedItem("doc_type") as HTMLInputElement).value;
      const file = fileInput.files?.[0];
      if (!file) {
        throw new Error("Bitte eine Datei auswählen.");
      }
      await uploadDocument(this.hass, this.plant.id, file, docType);
      form.reset();
      await this._load();
    });
  }

  private _currentMetricOptions() {
    return this.metricCatalogue[this.plantTypeKey] ?? [];
  }

  protected render() {
    return html`
      ${this._renderAnomalies()}
      ${this._renderInspections()}
      ${this._renderFindings()}
      ${this._renderMetrics()}
      ${this._renderDocuments()}
    `;
  }

  private _renderAnomalies() {
    if (!this._anomalies.length) return nothing;
    return html`
      <div class="card">
        <h2>Anomalien</h2>
        ${this._anomalies.map((a) => {
          const causes: string[] = a.possible_causes_json ? JSON.parse(a.possible_causes_json) : [];
          return html`
            <div class="row" style="align-items: flex-start; flex-direction: column; gap: 6px;">
              <div style="display:flex; justify-content: space-between; width: 100%;">
                <strong>${a.metric_key}</strong>
                <techdoc-status-badge
                  status=${a.severity}
                  label=${`${a.severity} · ${(a.confidence * 100).toFixed(0)}% Konfidenz`}
                ></techdoc-status-badge>
              </div>
              <div>${a.description}</div>
              ${causes.length
                ? html`<div class="row-subtitle">Mögliche Ursachen: ${causes.join(", ")}</div>`
                : nothing}
              <div class="row-actions">
                <button class="secondary" @click=${() => this._handleAnomalyStatus(a.id, "bestaetigt")}>
                  Bestätigen
                </button>
                <button class="text" @click=${() => this._handleAnomalyStatus(a.id, "nicht_relevant")}>
                  Nicht relevant
                </button>
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }

  private _renderInspections() {
    return html`
      <div class="card">
        <h2>Prüfungen</h2>
        ${this._inspections.length
          ? this._inspections.map(
              (i) => html`
                <div class="row">
                  <div class="row-main">
                    <span class="row-title">${i.type} · ${i.date}</span>
                    <span class="row-subtitle">
                      ${i.inspector ? `Prüfer: ${i.inspector} · ` : ""}nächste Prüfung:
                      ${i.next_due_date ?? "–"}
                    </span>
                  </div>
                  <div class="row-actions">
                    <techdoc-status-badge
                      status=${i.status === "abgeschlossen" ? "ok" : "info"}
                      label=${i.status}
                    ></techdoc-status-badge>
                    ${i.status !== "abgeschlossen"
                      ? html`<button class="secondary" @click=${() => this._handleCompleteInspection(i.id)}>
                          Abschließen
                        </button>`
                      : nothing}
                    <button class="text" @click=${() => this._handleGenerateReport(i.id)}>
                      Bericht (PDF)
                    </button>
                  </div>
                </div>
              `
            )
          : html`<p class="empty">Noch keine Prüfungen.</p>`}
        <form class="inline" @submit=${this._handleCreateInspection}>
          <input name="type" placeholder="Prüfungsart (z. B. Jahresprüfung)" />
          <input name="inspector" placeholder="Prüfer" />
          <button type="submit">Prüfung starten</button>
        </form>
      </div>
    `;
  }

  private _renderFindings() {
    return html`
      <div class="card">
        <h2>Mängel</h2>
        ${this._findings.length
          ? this._findings.map(
              (f) => html`
                <div class="row">
                  <div class="row-main">
                    <span class="row-title">${f.description}</span>
                    <span class="row-subtitle">${f.date}${f.due_date ? ` · Frist: ${f.due_date}` : ""}</span>
                  </div>
                  <techdoc-status-badge status=${f.priority} label=${f.status}></techdoc-status-badge>
                </div>
              `
            )
          : html`<p class="empty">Keine Mängel für diese Anlage.</p>`}
        <form class="inline" @submit=${this._handleCreateFinding}>
          <input name="description" placeholder="Beschreibung" required />
          <select name="priority">
            <option value="niedrig">niedrig</option>
            <option value="mittel" selected>mittel</option>
            <option value="hoch">hoch</option>
            <option value="kritisch">kritisch</option>
          </select>
          <button type="submit">Anlegen</button>
        </form>
      </div>
    `;
  }

  private _renderMetrics() {
    const options = this._currentMetricOptions();
    return html`
      <div class="card">
        <h2>Kennzahlen &amp; Sensor-Zuordnung</h2>
        ${this._sensorMappings.length
          ? this._sensorMappings.map(
              (m) => html`
                <div class="row">
                  <div class="row-main">
                    <a href="#" @click=${(e: Event) => { e.preventDefault(); this._handleShowYearly(m.metric_key); }}
                      >${m.metric_key}</a
                    >
                    <span class="row-subtitle">${m.entity_id} · ${m.aggregation === "mean" ? "Mittelwert" : "Summe"}</span>
                  </div>
                  <button class="text" @click=${() => this._handleDeleteSensorMapping(m.id)}>Entfernen</button>
                </div>
              `
            )
          : html`<p class="empty">Noch keine Sensoren zugeordnet.</p>`}
        <form class="inline" @submit=${this._handleAddSensorMapping}>
          <input name="metric_key" list="metric-key-options" placeholder="Kennzahl (metric_key)" required />
          <datalist id="metric-key-options">
            ${options.map((m) => html`<option value=${m.key}>${m.name}</option>`)}
          </datalist>
          <input name="entity_id" placeholder="z. B. sensor.pv_jahresertrag" required />
          <select name="aggregation" title="Wie wird der Sensor statistisch erfasst?">
            <option value="sum">Summe (z. B. Energie, kWh)</option>
            <option value="mean">Mittelwert (z. B. COP, Temperatur)</option>
          </select>
          <button type="submit">Zuordnen</button>
        </form>
        ${this._renderYearlyTotals()}
      </div>
    `;
  }

  private _renderYearlyTotals() {
    if (!this._yearlyTotals) return nothing;
    const years = Object.keys(this._yearlyTotals.totals).sort();
    if (!years.length) {
      return html`<p class="empty">Keine Daten für ${this._yearlyTotalsMetricKey} verfügbar.</p>`;
    }
    return html`
      <h3>Jahresvergleich: ${this._yearlyTotalsMetricKey}</h3>
      ${years.map(
        (y) => html`
          <div class="row">
            <span>${y}</span>
            <span>${this._yearlyTotals!.totals[y].toFixed(1)} ${this._yearlyTotals!.unit ?? ""}</span>
          </div>
        `
      )}
    `;
  }

  private _renderDocuments() {
    return html`
      <div class="card">
        <h2>Dokumente</h2>
        ${this._documents.length
          ? this._documents.map(
              (d) => html`
                <div class="row">
                  <a href="/api/techdoc/documents/${d.id}" target="_blank">${d.type}: ${d.filename}</a>
                </div>
              `
            )
          : html`<p class="empty">Noch keine Dokumente.</p>`}
        <form class="inline" @submit=${this._handleUpload}>
          <input name="doc_type" placeholder="Dokumenttyp (z. B. Datenblatt)" />
          <input name="file" type="file" required />
          <button type="submit">Hochladen</button>
        </form>
      </div>
    `;
  }
}
