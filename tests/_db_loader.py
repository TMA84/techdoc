"""Import custom_components/techdoc/db/* without pulling in the
package's own __init__ chain (which imports `homeassistant`).

The db/ subpackage is intentionally HA-agnostic (see db/repository.py), so it
can be exercised by plain, fast unit tests. This loader gives it a synthetic
package identity purely for import machinery purposes.
"""
from __future__ import annotations

import importlib
import importlib.util
import sys
from pathlib import Path

_DB_DIR = (
    Path(__file__).resolve().parents[1]
    / "custom_components"
    / "techdoc"
    / "db"
)
_PACKAGE_NAME = "_techdoc_db"


def import_db_module(name: str):
    """Return custom_components/techdoc/db/<name>.py, HA-free."""
    if _PACKAGE_NAME not in sys.modules:
        spec = importlib.util.spec_from_file_location(
            _PACKAGE_NAME,
            _DB_DIR / "__init__.py",
            submodule_search_locations=[str(_DB_DIR)],
        )
        package = importlib.util.module_from_spec(spec)
        sys.modules[_PACKAGE_NAME] = package
        spec.loader.exec_module(package)

    return importlib.import_module(f"{_PACKAGE_NAME}.{name}")
