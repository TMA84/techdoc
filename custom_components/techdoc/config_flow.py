"""Config flow: one-time setup only.

Ongoing management of buildings/plants/inspections happens through the
panel's websocket API, not through additional config-flow steps.
"""
from __future__ import annotations

from homeassistant.config_entries import ConfigFlow

from .const import DOMAIN


class TechDocConfigFlow(ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, user_input: dict | None = None):
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        if user_input is not None:
            return self.async_create_entry(title="TechDoc", data={})

        return self.async_show_form(step_id="user")
