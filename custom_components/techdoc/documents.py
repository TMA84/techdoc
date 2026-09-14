"""Content-addressed, path-traversal-safe storage for uploaded documents.

Stored filenames are always derived from the file's own SHA-256 hash plus a
validated extension — never from the user-supplied original filename. This
means even a malicious `original_filename` (e.g. containing `../..`) can
never influence where a file is written or read from.
"""
from __future__ import annotations

import hashlib
import re
from pathlib import Path

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".webp"}

_STORED_NAME_RE = re.compile(r"^[0-9a-f]{64}(\.pdf|\.jpe?g|\.png|\.webp)$")


class UnsupportedFileType(ValueError):
    """Raised when a document's extension is not in ALLOWED_EXTENSIONS."""


def safe_extension(original_filename: str) -> str:
    suffix = Path(original_filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise UnsupportedFileType(
            f"Dateityp '{suffix}' ist nicht erlaubt (erlaubt: {sorted(ALLOWED_EXTENSIONS)})"
        )
    return suffix


class DocumentStorage:
    """Owns a single base directory that all documents are stored under."""

    def __init__(self, base_dir: Path | str) -> None:
        self._base_dir = Path(base_dir)

    def save(self, content: bytes, original_filename: str) -> tuple[str, str]:
        """Write `content` to disk. Returns (stored_filename, sha256_hex)."""
        extension = safe_extension(original_filename)
        content_hash = hashlib.sha256(content).hexdigest()
        stored_filename = f"{content_hash}{extension}"

        self._base_dir.mkdir(parents=True, exist_ok=True)
        target = self._base_dir / stored_filename
        if not target.exists():
            target.write_bytes(content)
        return stored_filename, content_hash

    def resolve_path(self, stored_filename: str) -> Path:
        """Validate and resolve a stored filename to an absolute path.

        Raises ValueError for anything that is not exactly a
        `<sha256><allowed-extension>` name — this rejects path separators,
        `..`, and any other traversal attempt even if such a value ever made
        it in from an untrusted source.
        """
        if not _STORED_NAME_RE.match(stored_filename):
            raise ValueError(f"Ungültiger Dokumentname: {stored_filename!r}")
        return self._base_dir / stored_filename

    def delete(self, stored_filename: str) -> None:
        path = self.resolve_path(stored_filename)
        path.unlink(missing_ok=True)
