"""TechDoc (Haustechnik-Pruefdokumentation) integration."""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOCUMENTS_SUBDIR, DOMAIN, PANEL_ICON, PANEL_TITLE, PANEL_URL_PATH, PLATFORMS
from .coordinator import TechDocCoordinator
from .db.engine import Database
from .documents import DocumentStorage
from .http_views import async_register_http_views
from .services import async_register_services
from .websocket_api import async_register_websocket_commands

_PANEL_DIR = Path(__file__).parent / "panel"
_PANEL_URL_BASE = "/techdoc_panel"


@dataclass(slots=True)
class TechDocRuntimeData:
    database: Database
    coordinator: TechDocCoordinator
    document_storage: DocumentStorage


type TechDocConfigEntry = ConfigEntry[TechDocRuntimeData]


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    async_register_websocket_commands(hass)
    async_register_services(hass)
    async_register_http_views(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: TechDocConfigEntry) -> bool:
    database = Database(hass)
    await database.async_setup()

    coordinator = TechDocCoordinator(hass, database)
    await coordinator.async_config_entry_first_refresh()

    document_storage = DocumentStorage(Path(hass.config.path(DOCUMENTS_SUBDIR)))

    entry.runtime_data = TechDocRuntimeData(
        database=database, coordinator=coordinator, document_storage=document_storage
    )

    await _async_register_panel(hass)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: TechDocConfigEntry) -> bool:
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        await entry.runtime_data.database.async_close()
        frontend.async_remove_panel(hass, PANEL_URL_PATH)
    return unload_ok


async def _async_register_panel(hass: HomeAssistant) -> None:
    """Serve the panel's JS bundle and register the sidebar entry.

    Guarded against DuplicateError/ValueError so a config entry reload does
    not fail on re-registering an already-known static path or panel.
    """
    try:
        await hass.http.async_register_static_paths(
            [StaticPathConfig(_PANEL_URL_BASE, str(_PANEL_DIR), cache_headers=False)]
        )
    except RuntimeError:
        pass

    try:
        await panel_custom.async_register_panel(
            hass,
            webcomponent_name="techdoc-panel",
            frontend_url_path=PANEL_URL_PATH,
            module_url=f"{_PANEL_URL_BASE}/techdoc-panel.js",
            sidebar_title=PANEL_TITLE,
            sidebar_icon=PANEL_ICON,
            require_admin=False,
            config={},
        )
    except ValueError:
        pass
