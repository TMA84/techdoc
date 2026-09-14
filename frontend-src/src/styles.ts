import { css } from "lit";

/**
 * Shared look & feel. Uses Home Assistant's own CSS custom properties (they
 * are already present on the page the panel is rendered into) instead of
 * importing any HA frontend components, so this stays a small, dependency-
 * free bundle that still fits the active HA theme (light/dark, accent color).
 */
export const sharedStyles = css`
  :host {
    display: block;
    padding: 16px;
    max-width: 960px;
    margin: 0 auto;
    color: var(--primary-text-color);
    font-family: var(--paper-font-body1_-_font-family, "Roboto", sans-serif);
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 500;
    margin: 0 0 16px;
  }

  h2 {
    font-size: 1.1rem;
    font-weight: 500;
    margin: 24px 0 8px;
  }

  h3 {
    font-size: 0.95rem;
    font-weight: 500;
    margin: 16px 0 8px;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .card {
    background: var(--card-background-color, var(--ha-card-background, white));
    border-radius: var(--ha-card-border-radius, 12px);
    box-shadow: var(--ha-card-box-shadow, 0 2px 6px rgba(0, 0, 0, 0.12));
    padding: 16px 20px;
    margin-bottom: 16px;
  }

  .clickable {
    cursor: pointer;
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid var(--divider-color, #e0e0e0);
  }
  .row:last-child {
    border-bottom: none;
  }

  .row-main {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .row-title {
    font-weight: 500;
  }
  .row-subtitle {
    font-size: 0.85rem;
    color: var(--secondary-text-color);
  }
  .row-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .empty {
    color: var(--secondary-text-color);
    font-style: italic;
    padding: 8px 0;
  }

  form.inline {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-top: 12px;
  }

  input,
  select {
    font: inherit;
    padding: 8px 10px;
    border: 1px solid var(--divider-color, #ccc);
    border-radius: 8px;
    background: var(--card-background-color, white);
    color: var(--primary-text-color);
  }

  button {
    font: inherit;
    padding: 8px 14px;
    border-radius: 8px;
    border: none;
    background: var(--primary-color, #03a9f4);
    color: var(--text-primary-color, white);
    cursor: pointer;
  }
  button:hover {
    filter: brightness(1.08);
  }
  button.secondary {
    background: transparent;
    color: var(--primary-color, #03a9f4);
    border: 1px solid var(--primary-color, #03a9f4);
  }
  button.text {
    background: transparent;
    color: var(--secondary-text-color);
    padding: 4px 8px;
  }

  .tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 20px;
    border-bottom: 1px solid var(--divider-color, #e0e0e0);
  }
  .tabs button {
    background: none;
    color: var(--secondary-text-color);
    border-radius: 0;
    padding: 10px 16px;
    border-bottom: 2px solid transparent;
  }
  .tabs button.active {
    color: var(--primary-color, #03a9f4);
    border-bottom-color: var(--primary-color, #03a9f4);
    font-weight: 500;
  }

  a {
    color: var(--primary-color, #03a9f4);
  }
`;
