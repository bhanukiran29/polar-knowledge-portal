"""Phase 1 backend tests for the Polar Knowledge Portal API.

Run from the backend directory:

    python -m pytest tests -v

The suite covers every endpoint required by the Phase 1 specification,
including search filters, 404 handling and safe related-id resolution.
"""

import json

from fastapi.testclient import TestClient

import main

client = TestClient(main.app)


# ---------------------------------------------------------------------------
# GET /
# ---------------------------------------------------------------------------
def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "API working"}


# ---------------------------------------------------------------------------
# GET /items
# ---------------------------------------------------------------------------
def test_items_returns_all_records():
    response = client.get("/items")
    assert response.status_code == 200
    items = response.json()
    assert isinstance(items, list)
    assert 20 <= len(items) <= 25
    types = {item["type"] for item in items}
    assert types == {"paper", "dataset", "expedition", "researcher", "institution"}


# ---------------------------------------------------------------------------
# GET /items/{id}
# ---------------------------------------------------------------------------
def test_get_item_valid_id():
    response = client.get("/items/1")
    assert response.status_code == 200
    assert response.json()["id"] == 1


def test_get_item_invalid_id_returns_404():
    response = client.get("/items/9999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_get_item_non_numeric_id_is_handled():
    response = client.get("/items/not-a-number")
    # FastAPI validation error, not a crash
    assert response.status_code in (404, 422)


# ---------------------------------------------------------------------------
# GET /search
# ---------------------------------------------------------------------------
def test_search_q_antarctica_is_case_insensitive():
    response = client.get("/search", params={"q": "antarctica"})
    assert response.status_code == 200
    results = response.json()
    assert results, "expected matches for 'antarctica'"
    for item in results:
        haystack = " ".join(
            str(item.get(field, "")) for field in main.SEARCHABLE_FIELDS
        ).lower()
        assert "antarctica" in haystack


def test_search_q_sea_ice():
    response = client.get("/search", params={"q": "sea ice"})
    assert response.status_code == 200
    results = response.json()
    assert results
    for item in results:
        haystack = " ".join(
            str(item.get(field, "")) for field in main.SEARCHABLE_FIELDS
        ).lower()
        assert "sea ice" in haystack


def test_search_type_paper():
    response = client.get("/search", params={"type": "paper"})
    assert response.status_code == 200
    results = response.json()
    assert results
    assert all(item["type"] == "paper" for item in results)
    assert len(results) == 6


def test_search_type_is_case_insensitive():
    response = client.get("/search", params={"type": "PAPER"})
    assert response.status_code == 200
    results = response.json()
    assert results
    assert all(item["type"] == "paper" for item in results)


def test_search_location_antarctica():
    response = client.get("/search", params={"location": "Antarctica"})
    assert response.status_code == 200
    results = response.json()
    assert results
    for item in results:
        assert "antarctica" in str(item.get("location", "")).lower()


def test_search_year():
    response = client.get("/search", params={"year": 2025})
    assert response.status_code == 200
    results = response.json()
    assert results
    assert all(item["year"] == 2025 for item in results)


def test_search_filters_without_q():
    response = client.get("/search", params={"location": "Arctic"})
    assert response.status_code == 200
    results = response.json()
    assert results
    for item in results:
        assert "arctic" in str(item.get("location", "")).lower()


def test_search_combined_filters():
    response = client.get("/search", params={"type": "dataset", "location": "Antarctica"})
    assert response.status_code == 200
    results = response.json()
    assert results
    assert all(
        item["type"] == "dataset" and "antarctica" in str(item["location"]).lower()
        for item in results
    )


def test_search_no_match_returns_empty_list():
    response = client.get("/search", params={"q": "quantumpancakes"})
    assert response.status_code == 200
    assert response.json() == []


# ---------------------------------------------------------------------------
# GET /items/{id}/related
# ---------------------------------------------------------------------------
def test_related_items_for_paper():
    response = client.get("/items/1/related")
    assert response.status_code == 200
    related = response.json()
    assert [item["id"] for item in related] == [7, 12, 16, 19]
    # Paper 1 should connect to a dataset, an expedition, a researcher and an institution
    assert {item["type"] for item in related} == {
        "dataset",
        "expedition",
        "researcher",
        "institution",
    }


def test_related_items_for_institution():
    response = client.get("/items/21/related")
    assert response.status_code == 200
    assert [item["id"] for item in response.json()] == [2, 7, 8, 13, 17]


def test_related_invalid_item_returns_404():
    response = client.get("/items/9999/related")
    assert response.status_code == 404


def test_related_missing_ids_are_skipped(monkeypatch, tmp_path):
    """Broken related_ids in the data must never crash the endpoint."""
    data = [
        {
            "id": 1,
            "title": "Sample paper",
            "type": "paper",
            "description": "demo",
            "year": 2024,
            "location": "Antarctica",
            "latitude": None,
            "longitude": None,
            "institution": "X",
            "tags": [],
            "source": None,
            "source_url": None,
            "related_ids": [2, 99, 3, 2],
        },
        {
            "id": 2,
            "title": "Sample dataset",
            "type": "dataset",
            "description": "demo",
            "year": 2024,
            "location": None,
            "latitude": None,
            "longitude": None,
            "institution": None,
            "tags": [],
            "source": None,
            "source_url": None,
            "related_ids": [],
        },
        {
            "id": 3,
            "title": "Sample expedition",
            "type": "expedition",
            "description": "demo",
            "year": 2024,
            "location": None,
            "latitude": None,
            "longitude": None,
            "institution": None,
            "tags": [],
            "source": None,
            "source_url": None,
            "related_ids": [],
        },
    ]
    tmp_file = tmp_path / "data.json"
    tmp_file.write_text(json.dumps(data), encoding="utf-8")
    monkeypatch.setattr(main, "DATA_FILE", tmp_file)

    response = client.get("/items/1/related")
    assert response.status_code == 200
    # id 99 does not exist -> skipped; duplicate id 2 -> de-duplicated
    assert [item["id"] for item in response.json()] == [2, 3]
