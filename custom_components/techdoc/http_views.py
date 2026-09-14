"""HTTP endpoints for document upload/download.

Documents are content-addressed (see documents.py); the download endpoint
never trusts a client-supplied path, it always resolves the stored filename
through the database by document id first.
"""
from __future__ import annotations

from aiohttp import web
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .const import DOMAIN
from .documents import UnsupportedFileType

_CONTENT_TYPES = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
}


def _optional_int(value: str | None) -> int | None:
    return int(value) if value else None


def _get_runtime_data(hass: HomeAssistant):
    entries = hass.config_entries.async_entries(DOMAIN)
    return entries[0].runtime_data if entries else None


class DocumentUploadView(HomeAssistantView):
    url = "/api/techdoc/documents"
    name = "api:techdoc:documents"

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass

    async def post(self, request: web.Request) -> web.Response:
        runtime = _get_runtime_data(self._hass)
        if runtime is None:
            return web.json_response({"error": "not_configured"}, status=503)

        content: bytes | None = None
        original_filename = "upload"
        form_fields: dict[str, str] = {}

        reader = await request.multipart()
        async for part in reader:
            if part.name == "file":
                original_filename = part.filename or original_filename
                content = await part.read(decode=False)
            elif part.name is not None:
                form_fields[part.name] = (await part.read(decode=True)).decode("utf-8")

        if content is None:
            return web.json_response({"error": "missing_file"}, status=400)

        try:
            stored_filename, content_hash = await self._hass.async_add_executor_job(
                runtime.document_storage.save, content, original_filename
            )
        except UnsupportedFileType as err:
            return web.json_response({"error": str(err)}, status=400)

        document_id = await runtime.database.async_run(
            runtime.database.repository.create_document,
            form_fields.get("type", "Sonstiges"),
            stored_filename,
            content_hash,
            dt_util.utcnow().isoformat(),
            plant_id=_optional_int(form_fields.get("plant_id")),
            inspection_id=_optional_int(form_fields.get("inspection_id")),
            finding_id=_optional_int(form_fields.get("finding_id")),
        )
        return web.json_response({"id": document_id, "filename": stored_filename})


class DocumentDownloadView(HomeAssistantView):
    url = "/api/techdoc/documents/{document_id}"
    name = "api:techdoc:document"

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass

    async def get(self, request: web.Request, document_id: str) -> web.Response:
        runtime = _get_runtime_data(self._hass)
        if runtime is None:
            return web.json_response({"error": "not_configured"}, status=503)

        try:
            document_id_int = int(document_id)
        except ValueError:
            return web.json_response({"error": "invalid_id"}, status=400)

        document = await runtime.database.async_run(
            runtime.database.repository.get_document, document_id_int
        )
        if document is None:
            return web.json_response({"error": "not_found"}, status=404)

        path = runtime.document_storage.resolve_path(document.filename)
        content = await self._hass.async_add_executor_job(path.read_bytes)
        content_type = _CONTENT_TYPES.get(path.suffix, "application/octet-stream")
        return web.Response(body=content, content_type=content_type)


def async_register_http_views(hass: HomeAssistant) -> None:
    hass.http.register_view(DocumentUploadView(hass))
    hass.http.register_view(DocumentDownloadView(hass))
