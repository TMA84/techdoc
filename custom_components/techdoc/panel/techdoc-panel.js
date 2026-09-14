/**
 * Sidebar panel: Anlagen (mit Prüfungen & Dokumenten) + Mängel.
 *
 * Deliberately a plain HTMLElement (no Lit/build step) so it can be served
 * as-is. A Lit-based rewrite is planned once the UI surface grows further
 * (Phase 6 polish).
 */
class TechDocPanel extends HTMLElement {
  constructor() {
    super();
    this._plants = [];
    this._plantTypes = [];
    this._findings = [];
    this._tab = "anlagen";
    this._selectedPlantId = null;
    this._selectedPlantInspections = [];
    this._selectedPlantDocuments = [];
    this._selectedPlantSensorMappings = [];
    this._selectedPlantAnomalies = [];
    this._metricCatalogue = {};
    this._yearlyTotals = null;
    this._yearlyTotalsMetricKey = null;
    this._lastAnnualReportDocumentId = null;
  }

  set hass(hass) {
    const firstLoad = !this._hass;
    this._hass = hass;
    if (firstLoad) {
      this._loadOverview();
    }
  }

  get hass() {
    return this._hass;
  }

  async _ws(message) {
    return this._hass.callWS(message);
  }

  async _loadOverview() {
    const [plantTypes, plants, findings, metricCatalogue] = await Promise.all([
      this._ws({ type: "techdoc/plant_type_list" }),
      this._ws({ type: "techdoc/plant_list" }),
      this._ws({ type: "techdoc/finding_list" }),
      this._ws({ type: "techdoc/metric_catalogue" }),
    ]);
    this._plantTypes = plantTypes;
    this._plants = plants;
    this._findings = findings;
    this._metricCatalogue = metricCatalogue;
    this._render();
  }

  async _loadPlantDetail(plantId) {
    this._selectedPlantId = plantId;
    this._yearlyTotals = null;
    this._yearlyTotalsMetricKey = null;
    const [inspections, documents, sensorMappings, anomalies] = await Promise.all([
      this._ws({ type: "techdoc/inspection_list", plant_id: plantId }),
      this._ws({ type: "techdoc/document_list", plant_id: plantId }),
      this._ws({ type: "techdoc/sensor_mapping_list", plant_id: plantId }),
      this._ws({ type: "techdoc/anomaly_list", plant_id: plantId, status: "offen" }),
    ]);
    this._selectedPlantInspections = inspections;
    this._selectedPlantDocuments = documents;
    this._selectedPlantSensorMappings = sensorMappings;
    this._selectedPlantAnomalies = anomalies;
    this._render();
  }

  async _handleCreatePlant(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.elements.name.value.trim();
    const plantTypeId = parseInt(form.elements.plant_type_id.value, 10);
    if (!name || !plantTypeId) return;
    await this._ws({ type: "techdoc/plant_create", name, plant_type_id: plantTypeId });
    form.reset();
    await this._loadOverview();
  }

  async _handleCreateInspection(event) {
    event.preventDefault();
    const form = event.target;
    const plantId = this._selectedPlantId;
    const type = form.elements.type.value.trim() || "sonstige";
    const inspector = form.elements.inspector.value.trim() || undefined;
    await this._ws({
      type: "techdoc/inspection_create",
      plant_id: plantId,
      date: new Date().toISOString().slice(0, 10),
      type,
      inspector,
    });
    form.reset();
    await this._loadPlantDetail(plantId);
  }

  async _handleCompleteInspection(inspectionId) {
    await this._ws({ type: "techdoc/inspection_complete", inspection_id: inspectionId });
    await this._loadPlantDetail(this._selectedPlantId);
    await this._loadOverview();
  }

  async _handleGenerateInspectionReport(inspectionId) {
    await this._ws({
      type: "techdoc/report_generate_inspection",
      inspection_id: inspectionId,
    });
    await this._loadPlantDetail(this._selectedPlantId);
  }

  async _handleGenerateAnnualReport() {
    const result = await this._ws({
      type: "techdoc/report_generate_annual",
      year: new Date().getFullYear(),
    });
    this._lastAnnualReportDocumentId = result.document_id;
    this._render();
  }

  async _handleCreateFinding(event) {
    event.preventDefault();
    const form = event.target;
    const description = form.elements.description.value.trim();
    if (!description) return;
    await this._ws({
      type: "techdoc/finding_create",
      plant_id: this._selectedPlantId,
      description,
      date: new Date().toISOString().slice(0, 10),
      priority: form.elements.priority.value,
    });
    form.reset();
    await this._loadOverview();
  }

  async _handleCloseFinding(findingId) {
    await this._ws({
      type: "techdoc/finding_update_status",
      finding_id: findingId,
      status: "erledigt",
      resolved_at: new Date().toISOString().slice(0, 10),
    });
    await this._loadOverview();
  }

  async _handleUploadDocument(event) {
    event.preventDefault();
    const form = event.target;
    const file = form.elements.file.files[0];
    if (!file) return;

    const body = new FormData();
    body.append("file", file);
    body.append("type", form.elements.doc_type.value || "Sonstiges");
    body.append("plant_id", String(this._selectedPlantId));

    await fetch("/api/techdoc/documents", {
      method: "POST",
      headers: { Authorization: `Bearer ${this._hass.auth.data.access_token}` },
      body,
    });
    form.reset();
    await this._loadPlantDetail(this._selectedPlantId);
  }

  async _handleAddSensorMapping(event) {
    event.preventDefault();
    const form = event.target;
    const metricKey = form.elements.metric_key.value.trim();
    const entityId = form.elements.entity_id.value.trim();
    if (!metricKey || !entityId) return;

    const catalogueEntry = this._currentPlantMetricOptions().find((m) => m.key === metricKey);
    await this._ws({
      type: "techdoc/sensor_mapping_upsert",
      plant_id: this._selectedPlantId,
      metric_key: metricKey,
      entity_id: entityId,
      unit: catalogueEntry?.unit ?? undefined,
    });
    form.reset();
    await this._loadPlantDetail(this._selectedPlantId);
  }

  async _handleDeleteSensorMapping(mappingId) {
    await this._ws({ type: "techdoc/sensor_mapping_delete", mapping_id: mappingId });
    await this._loadPlantDetail(this._selectedPlantId);
  }

  async _handleShowYearlyTotals(metricKey) {
    const result = await this._ws({
      type: "techdoc/plant_metric_yearly",
      plant_id: this._selectedPlantId,
      metric_key: metricKey,
    });
    this._yearlyTotalsMetricKey = metricKey;
    this._yearlyTotals = result;
    this._render();
  }

  async _handleAnomalyStatus(anomalyId, status) {
    await this._ws({ type: "techdoc/anomaly_update_status", anomaly_id: anomalyId, status });
    await this._loadPlantDetail(this._selectedPlantId);
  }

  _currentPlantMetricOptions() {
    const plant = this._plants.find((p) => p.id === this._selectedPlantId);
    if (!plant) return [];
    const plantType = this._plantTypes.find((pt) => pt.id === plant.plant_type_id);
    return (plantType && this._metricCatalogue[plantType.key]) || [];
  }

  _setTab(tab) {
    this._tab = tab;
    this._render();
  }

  _plantName(id) {
    return this._plants.find((p) => p.id === id)?.name ?? `Anlage ${id}`;
  }

  _renderAnlagenTab() {
    const plantTypeName = (id) => this._plantTypes.find((pt) => pt.id === id)?.name ?? `Typ ${id}`;
    const selected = this._plants.find((p) => p.id === this._selectedPlantId);

    return `
      <button id="generate-annual-report-button">Jahresbericht ${new Date().getFullYear()} erzeugen</button>
      ${
        this._lastAnnualReportDocumentId
          ? `<p><a href="/api/techdoc/documents/${this._lastAnnualReportDocumentId}" target="_blank">Jahresbericht herunterladen</a></p>`
          : ""
      }
      ${
        this._plants.length
          ? `<table>
              <thead><tr><th>Name</th><th>Typ</th><th>Status</th><th>Nächste Prüfung</th></tr></thead>
              <tbody>
                ${this._plants
                  .map(
                    (p) => `<tr class="clickable" data-plant-id="${p.id}">
                        <td>${p.name}</td><td>${plantTypeName(p.plant_type_id)}</td>
                        <td>${p.status}</td><td>${p.next_inspection ?? "–"}</td>
                      </tr>`
                  )
                  .join("")}
              </tbody>
            </table>`
          : `<p class="empty">Noch keine Anlagen angelegt.</p>`
      }

      <h2>Anlage anlegen</h2>
      <form id="create-plant-form">
        <input name="name" placeholder="Name der Anlage" required />
        <select name="plant_type_id" required>
          ${this._plantTypes.map((pt) => `<option value="${pt.id}">${pt.name}</option>`).join("")}
        </select>
        <button type="submit">Anlegen</button>
      </form>

      ${selected ? this._renderPlantDetail(selected) : ""}
    `;
  }

  _renderPlantDetail(plant) {
    return `
      <hr />
      <h2>${plant.name}</h2>

      ${this._renderAnomalies()}

      <h3>Prüfungen</h3>
      ${
        this._selectedPlantInspections.length
          ? `<table>
              <thead><tr><th>Datum</th><th>Art</th><th>Status</th><th>Nächste Prüfung</th><th></th></tr></thead>
              <tbody>
                ${this._selectedPlantInspections
                  .map(
                    (i) => `<tr>
                      <td>${i.date}</td><td>${i.type}</td><td>${i.status}</td>
                      <td>${i.next_due_date ?? "–"}</td>
                      <td>
                        ${
                          i.status !== "abgeschlossen"
                            ? `<button data-complete-inspection="${i.id}">Abschließen</button>`
                            : ""
                        }
                        <button data-generate-inspection-report="${i.id}">Bericht (PDF)</button>
                      </td>
                    </tr>`
                  )
                  .join("")}
              </tbody>
            </table>`
          : `<p class="empty">Noch keine Prüfungen.</p>`
      }
      <form id="create-inspection-form">
        <input name="type" placeholder="Prüfungsart (z. B. Jahresprüfung)" />
        <input name="inspector" placeholder="Prüfer" />
        <button type="submit">Prüfung starten</button>
      </form>

      <h3>Mangel erfassen</h3>
      <form id="create-finding-form">
        <input name="description" placeholder="Beschreibung" required />
        <select name="priority">
          <option value="niedrig">niedrig</option>
          <option value="mittel" selected>mittel</option>
          <option value="hoch">hoch</option>
          <option value="kritisch">kritisch</option>
        </select>
        <button type="submit">Anlegen</button>
      </form>

      <h3>Dokumente</h3>
      ${
        this._selectedPlantDocuments.length
          ? `<ul>${this._selectedPlantDocuments
              .map(
                (d) =>
                  `<li><a href="/api/techdoc/documents/${d.id}" target="_blank">${d.type}: ${d.filename}</a></li>`
              )
              .join("")}</ul>`
          : `<p class="empty">Noch keine Dokumente.</p>`
      }
      <form id="upload-document-form">
        <input name="doc_type" placeholder="Dokumenttyp (z. B. Datenblatt)" />
        <input name="file" type="file" required />
        <button type="submit">Hochladen</button>
      </form>

      <h3>Kennzahlen &amp; Sensor-Zuordnung</h3>
      ${
        this._selectedPlantSensorMappings.length
          ? `<table>
              <thead><tr><th>Kennzahl</th><th>Entity</th><th></th></tr></thead>
              <tbody>
                ${this._selectedPlantSensorMappings
                  .map(
                    (m) => `<tr>
                      <td><a href="#" data-show-yearly="${m.metric_key}">${m.metric_key}</a></td>
                      <td>${m.entity_id}</td>
                      <td><button data-delete-mapping="${m.id}">Entfernen</button></td>
                    </tr>`
                  )
                  .join("")}
              </tbody>
            </table>`
          : `<p class="empty">Noch keine Sensoren zugeordnet.</p>`
      }
      <form id="add-sensor-mapping-form">
        <input name="metric_key" list="metric-key-options" placeholder="Kennzahl (metric_key)" required />
        <datalist id="metric-key-options">
          ${this._currentPlantMetricOptions()
            .map((m) => `<option value="${m.key}">${m.name}</option>`)
            .join("")}
        </datalist>
        <input name="entity_id" placeholder="z. B. sensor.pv_jahresertrag" required />
        <button type="submit">Zuordnen</button>
      </form>
      ${this._renderYearlyTotals()}
    `;
  }

  _renderAnomalies() {
    if (!this._selectedPlantAnomalies.length) return "";
    const severityIcon = { kritisch: "🔴", hoch: "🟠", mittel: "🟡", niedrig: "🔵", info: "⚪" };
    return `
      <h3>Anomalien</h3>
      <ul>
        ${this._selectedPlantAnomalies
          .map(
            (a) => `<li>
              ${severityIcon[a.severity] ?? "⚪"} <strong>${a.metric_key}</strong> (${(a.confidence * 100).toFixed(0)}% Konfidenz)<br />
              ${a.description}
              ${
                JSON.parse(a.possible_causes_json || "[]").length
                  ? `<br /><em>Mögliche Ursachen: ${JSON.parse(a.possible_causes_json).join(", ")}</em>`
                  : ""
              }
              <br />
              <button data-anomaly-status="${a.id}:bestaetigt">Bestätigen</button>
              <button data-anomaly-status="${a.id}:nicht_relevant">Nicht relevant</button>
            </li>`
          )
          .join("")}
      </ul>
    `;
  }

  _renderYearlyTotals() {
    if (!this._yearlyTotals) return "";
    const totals = this._yearlyTotals.totals;
    const years = Object.keys(totals).sort();
    if (!years.length) {
      return `<p class="empty">Keine Daten für ${this._yearlyTotalsMetricKey} verfügbar.</p>`;
    }
    return `
      <h4>Jahresvergleich: ${this._yearlyTotalsMetricKey}</h4>
      <table>
        <thead><tr><th>Jahr</th><th>Wert</th></tr></thead>
        <tbody>
          ${years
            .map((y) => `<tr><td>${y}</td><td>${totals[y].toFixed(1)} ${this._yearlyTotals.unit ?? ""}</td></tr>`)
            .join("")}
        </tbody>
      </table>
    `;
  }

  _renderMaengelTab() {
    const openFindings = this._findings.filter((f) => f.status === "offen");
    return `
      ${
        openFindings.length
          ? `<table>
              <thead><tr><th>Anlage</th><th>Beschreibung</th><th>Priorität</th><th>Datum</th><th></th></tr></thead>
              <tbody>
                ${openFindings
                  .map(
                    (f) => `<tr>
                      <td>${this._plantName(f.plant_id)}</td><td>${f.description}</td>
                      <td>${f.priority}</td><td>${f.date}</td>
                      <td><button data-close-finding="${f.id}">Erledigt</button></td>
                    </tr>`
                  )
                  .join("")}
              </tbody>
            </table>`
          : `<p class="empty">Keine offenen Mängel. 🟢</p>`
      }
    `;
  }

  _render() {
    this.innerHTML = `
      <style>
        .htp-wrap { padding: 16px; max-width: 780px; font-family: var(--paper-font-body1_-_font-family, sans-serif); }
        h1 { font-size: 1.4em; }
        h2 { font-size: 1.15em; margin-top: 24px; }
        h3 { font-size: 1em; margin-top: 16px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--divider-color, #ddd); }
        tr.clickable { cursor: pointer; }
        tr.clickable:hover { background: var(--secondary-background-color, #f4f4f4); }
        form { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 8px; }
        input, select { padding: 6px; }
        button { padding: 6px 12px; cursor: pointer; }
        .empty { color: var(--secondary-text-color, #888); }
        .tabs { display: flex; gap: 4px; margin-bottom: 16px; }
        .tabs button { border: none; background: var(--secondary-background-color, #eee); }
        .tabs button.active { background: var(--primary-color, #03a9f4); color: white; }
      </style>
      <div class="htp-wrap">
        <h1>TechDoc</h1>
        <div class="tabs">
          <button data-tab="anlagen" class="${this._tab === "anlagen" ? "active" : ""}">Anlagen</button>
          <button data-tab="maengel" class="${this._tab === "maengel" ? "active" : ""}">
            Mängel (${this._findings.filter((f) => f.status === "offen").length})
          </button>
        </div>
        ${this._tab === "anlagen" ? this._renderAnlagenTab() : this._renderMaengelTab()}
      </div>
    `;

    this.querySelectorAll("[data-tab]").forEach((el) =>
      el.addEventListener("click", () => this._setTab(el.dataset.tab))
    );
    this.querySelectorAll("tr.clickable").forEach((el) =>
      el.addEventListener("click", () => this._loadPlantDetail(parseInt(el.dataset.plantId, 10)))
    );
    this.querySelectorAll("[data-complete-inspection]").forEach((el) =>
      el.addEventListener("click", () =>
        this._handleCompleteInspection(parseInt(el.dataset.completeInspection, 10))
      )
    );
    this.querySelectorAll("[data-generate-inspection-report]").forEach((el) =>
      el.addEventListener("click", () =>
        this._handleGenerateInspectionReport(parseInt(el.dataset.generateInspectionReport, 10))
      )
    );
    this.querySelector("#generate-annual-report-button")?.addEventListener("click", () =>
      this._handleGenerateAnnualReport()
    );
    this.querySelectorAll("[data-close-finding]").forEach((el) =>
      el.addEventListener("click", () => this._handleCloseFinding(parseInt(el.dataset.closeFinding, 10)))
    );
    this.querySelectorAll("[data-delete-mapping]").forEach((el) =>
      el.addEventListener("click", () =>
        this._handleDeleteSensorMapping(parseInt(el.dataset.deleteMapping, 10))
      )
    );
    this.querySelectorAll("[data-anomaly-status]").forEach((el) =>
      el.addEventListener("click", () => {
        const [anomalyId, status] = el.dataset.anomalyStatus.split(":");
        this._handleAnomalyStatus(parseInt(anomalyId, 10), status);
      })
    );
    this.querySelectorAll("[data-show-yearly]").forEach((el) =>
      el.addEventListener("click", (e) => {
        e.preventDefault();
        this._handleShowYearlyTotals(el.dataset.showYearly);
      })
    );

    this.querySelector("#create-plant-form")?.addEventListener("submit", (e) =>
      this._handleCreatePlant(e)
    );
    this.querySelector("#create-inspection-form")?.addEventListener("submit", (e) =>
      this._handleCreateInspection(e)
    );
    this.querySelector("#create-finding-form")?.addEventListener("submit", (e) =>
      this._handleCreateFinding(e)
    );
    this.querySelector("#upload-document-form")?.addEventListener("submit", (e) =>
      this._handleUploadDocument(e)
    );
    this.querySelector("#add-sensor-mapping-form")?.addEventListener("submit", (e) =>
      this._handleAddSensorMapping(e)
    );
  }
}

customElements.define("techdoc-panel", TechDocPanel);
