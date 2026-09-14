"""Import HA-agnostic modules from custom_components/techdoc
without executing the real package __init__.py (which imports
`homeassistant`).

Used for modules like `documents.py` or `analysis/stats.py` that live at the
integration's package root (as opposed to db/, which tests/_db_loader.py
handles with a narrower synthetic package rooted directly at db/).
"""
from __future__ import annotations

import importlib
import importlib.machinery
import importlib.util
import sys
from pathlib import Path

_PKG_DIR = (
    Path(__file__).resolve().parents[1] / "custom_components" / "techdoc"
)
_PACKAGE_NAME = "_techdoc_standalone"


def _ensure_root_package() -> None:
    if _PACKAGE_NAME in sys.modules:
        return
    spec = importlib.machinery.ModuleSpec(_PACKAGE_NAME, loader=None, is_package=True)
    spec.submodule_search_locations = [str(_PKG_DIR)]
    package = importlib.util.module_from_spec(spec)
    sys.modules[_PACKAGE_NAME] = package


def import_module(dotted_name: str):
    """dotted_name e.g. "documents" or "analysis.stats"."""
    _ensure_root_package()
    return importlib.import_module(f"{_PACKAGE_NAME}.{dotted_name}")
