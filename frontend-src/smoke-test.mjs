// One-off runtime smoke test: loads the built bundle (as a real ES module,
// via Node's own import()) into a jsdom-backed global environment, mounts
// <techdoc-panel> with a fake `hass`, and checks it renders without
// throwing. Not part of the shipped build; run manually after `npm run build`.
//
// Note: jsdom does not execute <script type="module"> tags at all, so the
// bundle must be loaded via import() with the DOM globals patched in first
// — it cannot be injected as a script element.
import { JSDOM } from "jsdom";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const bundlePath = path.join(here, "..", "custom_components", "techdoc", "panel", "techdoc-panel.js");

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/" });
const { window } = dom;
global.window = window;
global.document = window.document;
global.customElements = window.customElements;
global.HTMLElement = window.HTMLElement;
global.Element = window.Element;
global.Node = window.Node;
global.Document = window.Document;
global.Text = window.Text;
global.Comment = window.Comment;
global.CustomEvent = window.CustomEvent;
global.Event = window.Event;
global.ShadowRoot = window.ShadowRoot;
global.CSSStyleSheet = window.CSSStyleSheet;
global.DocumentFragment = window.DocumentFragment;
global.MutationObserver = window.MutationObserver;
global.SVGElement = window.SVGElement;
global.location = window.location;

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});
window.addEventListener("error", (e) => console.error("WINDOW ERROR:", e.error ?? e.message));

await import(pathToFileURL(bundlePath).href);

const fakeHass = {
  auth: { data: { access_token: "fake-token" } },
  states: {},
  callWS: async (msg) => {
    switch (msg.type) {
      case "techdoc/plant_type_list":
        return [{ id: 1, key: "pv", name: "Photovoltaikanlage", icon: null, is_custom: false }];
      case "techdoc/plant_list":
        return [];
      case "techdoc/finding_list":
        return [];
      case "techdoc/anomaly_list":
        return [];
      case "techdoc/metric_catalogue":
        return {};
      default:
        throw new Error(`smoke test: unhandled ws command ${msg.type}`);
    }
  },
};

const ctor = window.customElements.get("techdoc-panel");
if (!ctor) {
  throw new Error("techdoc-panel was not registered by the bundle");
}

const el = window.document.createElement("techdoc-panel");
window.document.body.appendChild(el);
el.hass = fakeHass;

// Wait for Lit's async render cycle(s): initial render + the overview reload
// triggered from `updated()` after `hass` is set.
await new Promise((resolve) => setTimeout(resolve, 300));

// `.textContent` does not pierce nested shadow roots (each custom element's
// shadow DOM is a separate subtree), so recurse manually to get the text a
// user would actually see — mirrors what real accessibility/testing-library
// tooling does.
function deepText(node) {
  let text = "";
  for (const child of node.childNodes) {
    if (child.nodeType === 3 /* TEXT_NODE */) {
      text += child.textContent;
    } else if (child.nodeType === 1 /* ELEMENT_NODE */) {
      if (child.tagName === "STYLE") continue;
      text += deepText(child.shadowRoot ?? child);
    }
  }
  return text;
}

function assertContains(text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`Expected rendered text to contain "${expected}". Full text was:\n${text}`);
  }
}

const anlagenText = deepText(el.shadowRoot);
for (const expected of ["TechDoc", "0 Anlagen", "Anlage anlegen", "Photovoltaikanlage", "Noch keine Anlagen angelegt"]) {
  assertContains(anlagenText, expected);
}

// Switch to the "Mängel" tab and check it renders too.
const tabButtons = [...el.shadowRoot.querySelectorAll(".tabs button")];
const maengelTab = tabButtons.find((b) => b.textContent.includes("Mängel"));
maengelTab.click();
await new Promise((resolve) => setTimeout(resolve, 50));
assertContains(deepText(el.shadowRoot), "Keine offenen Mängel");

console.log("Smoke test OK: <techdoc-panel> registers, mounts, and renders both tabs with a fake hass.");
