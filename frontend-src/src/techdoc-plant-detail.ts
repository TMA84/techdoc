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
  fetchDeviceEntities,
  fetchDeviceEntitySuggestions,
  fetchDevices,
  fetchDocuments,
  fetchInspections,
  fetchFindings,
  fetchPlantMetricYearly,
  fetchSensorMappings,
  generateInspectionReport,
  signPath,
  updateAnomalyStatus,
  uploadDocument,
  upsertSensorMapping,
} from "./ws";
import type {
  Anomaly,
  Device,
  DeviceEntity,
  DocumentRecord,
  Finding,
  HomeAssistant,
  Inspection,
  MetricCatalogue,
  MetricSuggestion,
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
  @state() private _yearlyTotalsByMetric: Record<string, YearlyTotalsResult | null> = {};
  @state() private _devices: Device[] = [];
  @state() private _deviceEntities: DeviceEntity[] = [];
  @state() private _selectedDeviceId = "";
  @state() private _entityIdDraft = "";
  @state() private _suggestions: MetricSuggestion[] = [];

  static styles = sharedStyles;

  protected willUpdate(changed: PropertyValues) {
    if (changed.has("plant") && this.plant) {
      const previous = changed.get("plant") as Plant | undefined;
      if (!previous || previous.id !== this.plant.id) {
        this._yearlyTotalsByMetric = {};
        this._selectedDeviceId = "";
        this._deviceEntities = [];
        this._suggestions = [];
        void this._load();
        if (!this._devices.length) {
          void fetchDevices(this.hass).then((devices) => (this._devices = devices));
        }
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

    // Fetch the yearly comparison for every mapped metric up front, instead
    // of requiring a click per metric — mapping a sensor showed nothing at
    // all otherwise unless you knew a plain-looking metric_key was secretly
    // a link. A metric with no statistics yet (or an incompatible entity)
    // just resolves to null and renders "keine Daten" for that row alone.
    const yearlyEntries = await Promise.all(
      sensorMappings.map(async (mapping) => {
        try {
          return [mapping.metric_key, await fetchPlantMetricYearly(this.hass, plantId, mapping.metric_key)] as const;
        } catch {
          return [mapping.metric_key, null] as const;
        }
      })
    );
    this._yearlyTotalsByMetric = Object.fromEntries(yearlyEntries);
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

  private async _handleDeviceChange(event: Event) {
    const deviceId = (event.target as HTMLSelectElement).value;
    this._selectedDeviceId = deviceId;
    if (!deviceId) {
      this._deviceEntities = [];
      this._suggestions = [];
      return;
    }
    await guarded(this, async () => {
      const [entities, suggestions] = await Promise.all([
        fetchDeviceEntities(this.hass, deviceId),
        fetchDeviceEntitySuggestions(this.hass, this.plant.id, deviceId),
      ]);
      this._deviceEntities = entities;
      this._suggestions = suggestions;
    });
  }

  private _handleEntityPick(event: Event) {
    const entityId = (event.target as HTMLSelectElement).value;
    if (entityId) {
      this._entityIdDraft = entityId;
    }
  }

  private async _handleApplySuggestion(suggestion: MetricSuggestion) {
    await guarded(this, async () => {
      await upsertSensorMapping(this.hass, this.plant.id, suggestion.metric_key, suggestion.entity_id);
      this._suggestions = this._suggestions.filter((s) => s.metric_key !== suggestion.metric_key);
      await this._load();
    });
  }

  private async _handleAddSensorMapping(event: SubmitEvent) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    await guarded(this, async () => {
      const metricKey = (form.elements.namedItem("metric_key") as HTMLInputElement).value.trim();
      const entityId = (form.elements.namedItem("entity_id") as HTMLInputElement).value.trim();
      if (!metricKey || !entityId) {
        throw new Error(
          "Bitte eine Kennzahl angeben und ein Gerät + Sensor auswählen (oder die Entity-ID direkt eingeben)."
        );
      }
      const catalogueEntry = this._currentMetricOptions().find((m) => m.key === metricKey);
      // aggregation/unit are inferred server-side from the entity's own state_class
      await upsertSensorMapping(
        this.hass,
        this.plant.id,
        metricKey,
        entityId,
        catalogueEntry?.unit ?? undefined
      );
      form.reset();
      this._entityIdDraft = "";
      this._deviceEntities = [];
      this._selectedDeviceId = "";
      this._suggestions = [];
      await this._load();
    });
  }

  private async _handleDeleteSensorMapping(id: number) {
    await guarded(this, async () => {
      await deleteSensorMapping(this.hass, id);
      await this._load();
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

  private _renderMappingRow(m: SensorMapping) {
    const state = this.hass.states[m.entity_id];
    const currentValue = state ? `${state.state} ${m.unit ?? state.attributes.unit_of_measurement ?? ""}` : "nicht verfügbar";
    const yearly = this._yearlyTotalsByMetric[m.metric_key];
    const years = yearly ? Object.keys(yearly.totals).sort().reverse() : [];

    return html`
      <div class="row" style="align-items: flex-start; flex-direction: column; gap: 4px;">
        <div style="display: flex; justify-content: space-between; width: 100%;">
          <div class="row-main">
            <span class="row-title">${m.metric_key}</span>
            <span class="row-subtitle"
              >${m.entity_id} · ${m.aggregation === "mean" ? "Mittelwert" : "Summe"} · aktuell:
              ${currentValue}</span
            >
          </div>
          <button class="text" @click=${() => this._handleDeleteSensorMapping(m.id)}>Entfernen</button>
        </div>
        ${yearly === undefined
          ? nothing
          : yearly === null || !years.length
            ? html`<div class="row-subtitle">Keine Langzeitstatistik verfügbar für diese Kennzahl.</div>`
            : html`<div class="row-subtitle">
                ${years.map((y) => `${y}: ${yearly.totals[y].toFixed(1)} ${yearly.unit ?? ""}`).join(" · ")}
              </div>`}
      </div>
    `;
  }

  private _renderMetrics() {
    const options = this._currentMetricOptions();
    return html`
      <div class="card">
        <h2>Kennzahlen &amp; Sensor-Zuordnung</h2>
        ${this._sensorMappings.length
          ? this._sensorMappings.map((m) => this._renderMappingRow(m))
          : html`<p class="empty">Noch keine Sensoren zugeordnet.</p>`}
        <h3>Gerät wählen</h3>
        <select class="inline" @change=${this._handleDeviceChange} .value=${this._selectedDeviceId}>
          <option value="">Gerät wählen …</option>
          ${this._devices.map((d) => html`<option value=${d.id}>${d.name}</option>`)}
        </select>

        ${this._suggestions.length
          ? html`
              <h3>Vorschläge für dieses Gerät</h3>
              ${this._suggestions.map(
                (s) => html`
                  <div class="row">
                    <div class="row-main">
                      <span class="row-title">${s.metric_name}</span>
                      <span class="row-subtitle">${s.entity_name} (${s.entity_id})</span>
                    </div>
                    <button @click=${() => this._handleApplySuggestion(s)}>Übernehmen</button>
                  </div>
                `
              )}
            `
          : nothing}

        <h3>Manuell zuordnen</h3>
        <form class="inline" @submit=${this._handleAddSensorMapping}>
          <input name="metric_key" list="metric-key-options" placeholder="Kennzahl (metric_key)" required />
          <datalist id="metric-key-options">
            ${options.map((m) => html`<option value=${m.key}>${m.name}</option>`)}
          </datalist>
          <select @change=${this._handleEntityPick} ?disabled=${!this._deviceEntities.length}>
            <option value="">${this._deviceEntities.length ? "Sensor wählen …" : "(erst Gerät wählen)"}</option>
            ${this._deviceEntities.map(
              (e) => html`<option value=${e.entity_id}>${e.name} (${e.entity_id})</option>`
            )}
          </select>
          <input
            name="entity_id"
            placeholder="oder Entity-ID direkt eingeben, z. B. sensor.pv_jahresertrag"
            .value=${this._entityIdDraft}
            @input=${(e: Event) => (this._entityIdDraft = (e.target as HTMLInputElement).value)}
            required
          />
          <button type="submit">Zuordnen</button>
        </form>
        <p class="row-subtitle">
          Summe/Mittelwert wird automatisch aus dem state_class-Attribut des gewählten Sensors erkannt.
        </p>
      </div>
    `;
  }

  private async _handleOpenDocument(event: Event, documentId: number) {
    event.preventDefault();
    // Open the tab synchronously, in direct response to the click, then
    // navigate it once the signed URL comes back — window.open() called
    // only after an await has no user-gesture context left and browsers
    // silently block it as a popup.
    const newTab = window.open("", "_blank");
    await guarded(this, async () => {
      const { path } = await signPath(this.hass, `/api/techdoc/documents/${documentId}`);
      if (newTab) {
        newTab.location.href = path;
      } else {
        window.open(path, "_blank");
      }
    });
  }

  private _renderDocuments() {
    return html`
      <div class="card">
        <h2>Dokumente</h2>
        ${this._documents.length
          ? this._documents.map(
              (d) => html`
                <div class="row">
                  <a href="#" @click=${(e: Event) => this._handleOpenDocument(e, d.id)}
                    >${d.type}: ${d.filename}</a
                  >
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
