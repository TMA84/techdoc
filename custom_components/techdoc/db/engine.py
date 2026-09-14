"""Async wrapper around the sqlite Repository for use inside Home Assistant.

All actual SQL lives in repository.py and is HA-agnostic; this module only
adds the executor-job plumbing required to keep sqlite3's blocking calls off
the event loop, as mandated by Home Assistant's async guidelines.
"""
from __future__ import annotations

import functools
from pathlib import Path
from typing import Any, Callable, TypeVar

from homeassistant.core import HomeAssistant

from ..const import DB_FILENAME, DEFAULT_CHECKLISTS, DEFAULT_PLANT_TYPES, DEFAULT_PLAUSIBILITY_RULES
from .repository import Repository, open_connection, run_migrations

_T = TypeVar("_T")


class Database:
    """Owns the sqlite connection and exposes async CRUD via Repository."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass
        self._db_path = Path(hass.config.path(DB_FILENAME))
        self._conn = None
        self._repository: Repository | None = None

    @property
    def repository(self) -> Repository:
        assert self._repository is not None, "Database.async_setup() was not awaited"
        return self._repository

    async def async_setup(self) -> None:
        self._conn = await self._hass.async_add_executor_job(open_connection, str(self._db_path))
        await self._hass.async_add_executor_job(run_migrations, self._conn)
        self._repository = Repository(self._conn)
        await self.async_run(self._repository.seed_default_plant_types, DEFAULT_PLANT_TYPES)
        await self.async_run(self._repository.seed_default_checklists, DEFAULT_CHECKLISTS)
        await self.async_run(
            self._repository.seed_default_plausibility_rules, DEFAULT_PLAUSIBILITY_RULES
        )

    async def async_run(self, func: Callable[..., _T], *args: Any, **kwargs: Any) -> _T:
        if kwargs:
            func = functools.partial(func, **kwargs)
        return await self._hass.async_add_executor_job(func, *args)

    async def async_close(self) -> None:
        if self._conn is not None:
            await self._hass.async_add_executor_job(self._conn.close)
