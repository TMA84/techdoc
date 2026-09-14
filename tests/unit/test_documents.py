import pytest

from tests._pkg_loader import import_module

documents_module = import_module("documents")
DocumentStorage = documents_module.DocumentStorage
UnsupportedFileType = documents_module.UnsupportedFileType


@pytest.fixture
def storage(tmp_path):
    return DocumentStorage(tmp_path / "documents")


def test_save_writes_content_addressed_file(storage):
    stored_filename, content_hash = storage.save(b"hello world", "wechselrichter.pdf")

    assert stored_filename == f"{content_hash}.pdf"
    assert storage.resolve_path(stored_filename).read_bytes() == b"hello world"


def test_save_rejects_disallowed_extension(storage):
    with pytest.raises(UnsupportedFileType):
        storage.save(b"#!/bin/sh\n", "script.sh")


def test_save_is_idempotent_for_identical_content(storage):
    name1, hash1 = storage.save(b"same bytes", "a.jpg")
    name2, hash2 = storage.save(b"same bytes", "b.jpg")

    assert name1 == name2
    assert hash1 == hash2


def test_resolve_path_rejects_traversal_attempts(storage):
    for malicious in ("../../etc/passwd", "..%2f..%2fetc%2fpasswd", "foo/../../bar.pdf", "a.exe"):
        with pytest.raises(ValueError):
            storage.resolve_path(malicious)


def test_delete_removes_file(storage):
    stored_filename, _ = storage.save(b"content", "foto.png")
    path = storage.resolve_path(stored_filename)
    assert path.exists()

    storage.delete(stored_filename)
    assert not path.exists()
