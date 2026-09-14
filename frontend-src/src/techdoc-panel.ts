import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles } from "./styles";
import { guarded } from "./errors";
import {
  fetchAnomalies,
  fetchFindings,
  fetchMetricCatalogue,
  fetchPlantTypes,
  fetchPlants,
  generateAnnualReport,
} from "./ws";
import type { Anomaly, Finding, HomeAssistant, MetricCatalogue, Plant, PlantType } from "./types";
import "./techdoc-plant-list";
import "./techdoc-plant-detail";
import "./techdoc-findings-overview";

type Tab = "anlagen" | "maengel";

@customElement("techdoc-panel")
export class TechdocPanel extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ type: Boolean }) public narrow = false;

  @state() private _tab: Tab = "anlagen";
  @state() private _plantTypes: PlantType[] = [];
  @state() private _plants: Plant[] = [];
  @state() private _findings: Finding[] = [];
  @state() private _anomalies: Anomaly[] = [];
  @state() private _metricCatalogue: MetricCatalogue = {};
  @state() private _selectedPlantId: number | null = null;
  @state() private _lastAnnualReportDocumentId: number | null = null;
  @state() private _loaded = false;
  @state() private _errorMessage: string | null = null;

  static styles = sharedStyles;

  protected updated(changed: Map<string, unknown>) {
    if (changed.has("hass") && this.hass && !this._loaded) {
      this._loaded = true;
      void this._loadOverview();
    }
  }

  private async _loadOverview() {
    const [plantTypes, plants, findings, anomalies, metricCatalogue] = await Promise.all([
      fetchPlantTypes(this.hass),
      fetchPlants(this.hass),
      fetchFindings(this.hass),
      fetchAnomalies(this.hass, undefined, "offen"),
      fetchMetricCatalogue(this.hass),
    ]);
    this._plantTypes = plantTypes;
    this._plants = plants;
    this._findings = findings;
    this._anomalies = anomalies;
    this._metricCatalogue = metricCatalogue;
  }

  private _onPlantSelect(event: CustomEvent<{ id: number }>) {
    this._selectedPlantId = event.detail.id;
  }

  private async _onPlantCreated() {
    await this._loadOverview();
  }

  private async _onChanged() {
    await this._loadOverview();
  }

  private async _handleGenerateAnnualReport() {
    await guarded(this, async () => {
      const result = await generateAnnualReport(this.hass, new Date().getFullYear());
      this._lastAnnualReportDocumentId = result.document_id;
    });
  }

  private _onError(event: CustomEvent<{ message: string }>) {
    this._errorMessage = event.detail.message;
  }

  private _selectedPlant(): Plant | undefined {
    return this._plants.find((p) => p.id === this._selectedPlantId);
  }

  private _selectedPlantTypeKey(): string {
    const plant = this._selectedPlant();
    if (!plant) return "";
    return this._plantTypes.find((pt) => pt.id === plant.plant_type_id)?.key ?? "";
  }

  protected render() {
    const openFindingsCount = this._findings.filter((f) => f.status === "offen").length;

    return html`
      <div @techdoc-error=${this._onError}>
        <h1>TechDoc</h1>

        ${this._errorMessage
          ? html`
              <div class="card" style="border: 1px solid #c62828; display:flex; justify-content: space-between; align-items: center;">
                <span>⚠️ ${this._errorMessage}</span>
                <button class="text" @click=${() => (this._errorMessage = null)}>Schließen</button>
              </div>
            `
          : nothing}

        <div class="card" style="display:flex; gap: 24px; flex-wrap: wrap;">
          <div><strong>${this._plants.length}</strong> Anlagen</div>
          <div><strong>${openFindingsCount}</strong> offene Mängel</div>
          <div><strong>${this._anomalies.length}</strong> offene Anomalien</div>
        </div>

        <div class="tabs">
          <button
            class=${this._tab === "anlagen" ? "active" : ""}
            @click=${() => (this._tab = "anlagen")}
          >
            Anlagen
          </button>
          <button
            class=${this._tab === "maengel" ? "active" : ""}
            @click=${() => (this._tab = "maengel")}
          >
            Mängel (${openFindingsCount})
          </button>
        </div>

        ${this._tab === "anlagen" ? this._renderAnlagenTab() : this._renderMaengelTab()}
      </div>
    `;
  }

  private _renderAnlagenTab() {
    const selected = this._selectedPlant();
    return html`
      <div class="card">
        <button class="secondary" @click=${this._handleGenerateAnnualReport}>
          Jahresbericht ${new Date().getFullYear()} erzeugen
        </button>
        ${this._lastAnnualReportDocumentId
          ? html`<p>
              <a href="/api/techdoc/documents/${this._lastAnnualReportDocumentId}" target="_blank">
                Jahresbericht herunterladen
              </a>
            </p>`
          : nothing}
      </div>

      <techdoc-plant-list
        .hass=${this.hass}
        .plants=${this._plants}
        .plantTypes=${this._plantTypes}
        .selectedPlantId=${this._selectedPlantId}
        @plant-select=${this._onPlantSelect}
        @plant-created=${this._onPlantCreated}
      ></techdoc-plant-list>

      ${selected
        ? html`
            <h2 style="margin-top: 24px;">${selected.name}</h2>
            <techdoc-plant-detail
              .hass=${this.hass}
              .plant=${selected}
              .metricCatalogue=${this._metricCatalogue}
              .plantTypeKey=${this._selectedPlantTypeKey()}
              @techdoc-changed=${this._onChanged}
            ></techdoc-plant-detail>
          `
        : nothing}
    `;
  }

  private _renderMaengelTab() {
    return html`
      <techdoc-findings-overview
        .hass=${this.hass}
        .findings=${this._findings}
        .plants=${this._plants}
        @techdoc-changed=${this._onChanged}
      ></techdoc-findings-overview>
    `;
  }
}
